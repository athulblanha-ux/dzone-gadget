const ShippingRule = require('../models/ShippingRule');
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

exports.calculateFee = asyncHandler(async (req, res) => {
  const { state, subtotal } = req.body;
  if (subtotal === undefined) {
    return res.status(400).json({ success: false, message: 'Subtotal is required' });
  }

  let rule;
  if (state) {
    rule = await ShippingRule.findOne({ state: new RegExp(`^${state}$`, 'i') });
  }
  
  if (!rule) {
    rule = await ShippingRule.findOne({ state: new RegExp('^default$', 'i') });
  }

  if (!rule) {
    // Ultimate fallback if even Default rule is missing
    const fee = subtotal >= 499 ? 0 : 49;
    return res.json({ success: true, fee });
  }

  const fee = subtotal >= rule.freeShippingThreshold ? 0 : rule.baseFee;
  res.json({ success: true, fee });
});
