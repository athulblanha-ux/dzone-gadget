const ShippingRule = require('../models/ShippingRule');
const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getRules = asyncHandler(async (req, res) => {
  const rules = await ShippingRule.find().sort({ state: 1 });
  res.json({ success: true, rules });
});

exports.createRule = asyncHandler(async (req, res) => {
  const { state, baseFee, freeShippingThreshold } = req.body;
  if (!state) {
    return res.status(400).json({ success: false, message: 'State is required' });
  }

  const existing = await ShippingRule.findOne({ state: new RegExp(`^${state}$`, 'i') });
  if (existing) {
    return res.status(400).json({ success: false, message: 'Rule for this state already exists' });
  }

  const rule = await ShippingRule.create({
    state,
    baseFee: baseFee || 0,
    freeShippingThreshold: freeShippingThreshold || 0
  });

  res.status(201).json({ success: true, rule });
});

exports.updateRule = asyncHandler(async (req, res) => {
  const { baseFee, freeShippingThreshold } = req.body;
  const rule = await ShippingRule.findById(req.params.id);
  if (!rule) {
    return res.status(404).json({ success: false, message: 'Rule not found' });
  }

  if (baseFee !== undefined) rule.baseFee = baseFee;
  if (freeShippingThreshold !== undefined) rule.freeShippingThreshold = freeShippingThreshold;

  await rule.save();
  res.json({ success: true, rule });
});

exports.deleteRule = asyncHandler(async (req, res) => {
  const rule = await ShippingRule.findById(req.params.id);
  if (!rule) {
    return res.status(404).json({ success: false, message: 'Rule not found' });
  }

  // Prevent deleting the Default rule if we want to enforce it always existing
  if (rule.state.toLowerCase() === 'default') {
    return res.status(400).json({ success: false, message: 'Cannot delete the Default rule' });
  }

  await rule.deleteOne();
  res.json({ success: true, message: 'Rule deleted successfully' });
});

exports.calculateShippingFee = async (items, state, subtotal) => {
  let isKerala = false;
  if (state) {
    isKerala = state.trim().toLowerCase() === 'kerala';
  }

  let totalWeight = 0;
  let customDeliveryCharges = 0;
  let hasWeightBasedItems = false;

  if (items && items.length > 0) {
    for (const item of items) {
      const productId = item.product && item.product._id ? item.product._id : item.product;
      if (productId) {
        const product = await Product.findById(productId);
        if (product) {
          const weight = product.weight || 0; // weight in grams
          
          if (weight === 0 && product.deliveryCharge && product.deliveryCharge > 0) {
            customDeliveryCharges += product.deliveryCharge * item.quantity;
          } else {
            totalWeight += weight * item.quantity;
            hasWeightBasedItems = true;
          }
        }
      }
    }
  }

  let weightBasedShippingFee = 0;
  if (hasWeightBasedItems) {
    if (isKerala) {
      if (totalWeight <= 500) {
        weightBasedShippingFee = 60;
      } else if (totalWeight <= 1000) {
        weightBasedShippingFee = 80;
      } else {
        weightBasedShippingFee = Math.ceil(totalWeight / 1000) * 80;
      }
    } else {
      if (totalWeight <= 500) {
        weightBasedShippingFee = 90;
      } else if (totalWeight <= 1000) {
        weightBasedShippingFee = 120;
      } else {
        weightBasedShippingFee = Math.ceil(totalWeight / 1000) * 120;
      }
    }
  }

  return weightBasedShippingFee + customDeliveryCharges;
};

exports.calculateFee = asyncHandler(async (req, res) => {
  const { state, subtotal, items } = req.body;
  if (subtotal === undefined) {
    return res.status(400).json({ success: false, message: 'Subtotal is required' });
  }

  const fee = await exports.calculateShippingFee(items, state, subtotal);
  res.json({ success: true, fee });
});
