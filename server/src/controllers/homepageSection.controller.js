const HomepageSection = require('../models/HomepageSection');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getHomepageSections = asyncHandler(async (req, res) => {
  const sections = await HomepageSection.find({ isActive: true }).sort({ order: 1 }).lean();
  res.json({ success: true, sections });
});

exports.getAllSectionsAdmin = asyncHandler(async (req, res) => {
  const sections = await HomepageSection.find().sort({ order: 1 }).lean();
  res.json({ success: true, sections });
});

exports.createSection = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (typeof data.content === 'string') data.content = JSON.parse(data.content);
  if (typeof data.settings === 'string') data.settings = JSON.parse(data.settings);
  const section = await HomepageSection.create(data);
  res.status(201).json({ success: true, section });
});

exports.updateSection = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (typeof data.content === 'string') data.content = JSON.parse(data.content);
  if (typeof data.settings === 'string') data.settings = JSON.parse(data.settings);
  const section = await HomepageSection.findByIdAndUpdate(req.params.id, data, { new: true });
  if (!section) return res.status(404).json({ success: false, message: 'Section not found.' });
  res.json({ success: true, section });
});

exports.deleteSection = asyncHandler(async (req, res) => {
  await HomepageSection.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Section deleted.' });
});

exports.reorderSections = asyncHandler(async (req, res) => {
  const { orders } = req.body; // [{ id, order }]
  await Promise.all(orders.map(({ id, order }) => HomepageSection.findByIdAndUpdate(id, { order })));
  res.json({ success: true, message: 'Sections reordered.' });
});

exports.toggleSection = asyncHandler(async (req, res) => {
  const section = await HomepageSection.findById(req.params.id);
  if (!section) return res.status(404).json({ success: false, message: 'Section not found.' });
  section.isActive = !section.isActive;
  await section.save();
  res.json({ success: true, isActive: section.isActive });
});
