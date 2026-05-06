const FAQ = require('../models/FAQ');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getFAQs = asyncHandler(async (req, res) => {
  const filter = { isActive: true };
  if (req.query.category) filter.category = req.query.category;
  const faqs = await FAQ.find(filter).sort({ category: 1, order: 1 }).lean();
  res.json({ success: true, faqs });
});

exports.createFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.create(req.body);
  res.status(201).json({ success: true, faq });
});

exports.updateFAQ = asyncHandler(async (req, res) => {
  const faq = await FAQ.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!faq) return res.status(404).json({ success: false, message: 'FAQ not found.' });
  res.json({ success: true, faq });
});

exports.deleteFAQ = asyncHandler(async (req, res) => {
  await FAQ.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'FAQ deleted.' });
});
