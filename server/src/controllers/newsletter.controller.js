const Newsletter = require('../models/Newsletter');
const { asyncHandler } = require('../middleware/errorHandler');

exports.subscribe = asyncHandler(async (req, res) => {
  const { email, source } = req.body;
  const existing = await Newsletter.findOne({ email });
  if (existing) {
    if (!existing.isActive) { existing.isActive = true; existing.unsubscribedAt = undefined; await existing.save(); }
    return res.json({ success: true, message: 'You are already subscribed!' });
  }
  await Newsletter.create({ email, source });
  res.status(201).json({ success: true, message: 'Subscribed successfully! 🎉' });
});

exports.unsubscribe = asyncHandler(async (req, res) => {
  await Newsletter.findOneAndUpdate({ email: req.body.email }, { isActive: false, unsubscribedAt: new Date() });
  res.json({ success: true, message: 'Unsubscribed.' });
});

exports.getSubscribers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const [subscribers, total] = await Promise.all([
    Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Newsletter.countDocuments({ isActive: true }),
  ]);
  res.json({ success: true, subscribers, total });
});
