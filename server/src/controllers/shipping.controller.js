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

  if (isKerala) {
    return 0; // Kerala. Del = 0
  }

  // Not Kerala
  let totalShippingFee = 0;
  let hasProductDeliveryCharge = false;

  if (items && items.length > 0) {
    for (const item of items) {
      const productId = item.product && item.product._id ? item.product._id : item.product;
      if (productId) {
        const product = await Product.findById(productId);
        if (product && product.deliveryCharge && product.deliveryCharge > 0) {
          hasProductDeliveryCharge = true;
          let charge = product.deliveryCharge;
          if (charge === 60) {
            charge = 120;
          } else if (charge === 120) {
            charge = 200;
          }
          totalShippingFee += charge * item.quantity;
        }
      }
    }
  }

  // Fallback to default base fee only if no products have a delivery charge
  if (!hasProductDeliveryCharge) {
    const rule = await ShippingRule.findOne({ state: new RegExp('^default$', 'i') });
    totalShippingFee = rule ? rule.baseFee : 49;
  }

  return totalShippingFee;
};

exports.calculateFee = asyncHandler(async (req, res) => {
  const { state, subtotal, items } = req.body;
  if (subtotal === undefined) {
    return res.status(400).json({ success: false, message: 'Subtotal is required' });
  }

  const fee = await exports.calculateShippingFee(items, state, subtotal);
  res.json({ success: true, fee });
});
