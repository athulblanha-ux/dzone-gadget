const Category = require('../models/Category');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

exports.getCategories = asyncHandler(async (req, res) => {
  const { parentOnly, featured } = req.query;
  const filter = { isActive: true };
  if (parentOnly === 'true') filter.parent = null;
  if (featured === 'true') filter.isFeatured = true;

  const categories = await Category.find(filter)
    .populate('subcategories', 'name slug image icon isActive')
    .sort({ order: 1, name: 1 })
    .lean();

  res.json({ success: true, categories });
});

exports.getCategory = asyncHandler(async (req, res) => {
  const cat = await Category.findOne({ slug: req.params.slug, isActive: true })
    .populate('subcategories', 'name slug image icon');
  if (!cat) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, category: cat });
});

exports.createCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'dzone-gadget/categories');
    data.image = { url: result.secure_url, publicId: result.public_id };
  }
  const category = await Category.create(data);
  res.status(201).json({ success: true, category });
});

exports.updateCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    const existing = await Category.findById(req.params.id);
    if (existing?.image?.publicId) await deleteFromCloudinary(existing.image.publicId);
    const result = await uploadToCloudinary(req.file.buffer, 'dzone-gadget/categories');
    data.image = { url: result.secure_url, publicId: result.public_id };
  }
  const category = await Category.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  res.json({ success: true, category });
});

exports.deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found.' });
  if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
  await category.deleteOne();
  res.json({ success: true, message: 'Category deleted.' });
});

exports.reorderCategories = asyncHandler(async (req, res) => {
  const { orders } = req.body; // [{ id, order }]
  await Promise.all(orders.map(({ id, order }) => Category.findByIdAndUpdate(id, { order })));
  res.json({ success: true, message: 'Categories reordered.' });
});
