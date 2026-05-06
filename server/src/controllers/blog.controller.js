const Blog = require('../models/Blog');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

exports.getBlogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 9;
  const filter = { isPublished: true };
  if (req.query.tag) filter.tags = req.query.tag;
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search };
  const [blogs, total] = await Promise.all([
    Blog.find(filter).populate('author', 'name avatar').sort({ publishedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Blog.countDocuments(filter),
  ]);
  res.json({ success: true, blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).populate('author', 'name avatar');
  if (!blog) return res.status(404).json({ success: false, message: 'Blog post not found.' });
  blog.views += 1;
  await blog.save();
  res.json({ success: true, blog });
});

exports.createBlog = asyncHandler(async (req, res) => {
  const data = { ...req.body, author: req.user._id };
  if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
  if (req.file) {
    const result = await uploadToCloudinary(req.file.buffer, 'd-store/blogs');
    data.coverImage = { url: result.secure_url, publicId: result.public_id };
  }
  const blog = await Blog.create(data);
  res.status(201).json({ success: true, blog });
});

exports.updateBlog = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);
  if (req.file) {
    const existing = await Blog.findById(req.params.id);
    if (existing?.coverImage?.publicId) await deleteFromCloudinary(existing.coverImage.publicId);
    const result = await uploadToCloudinary(req.file.buffer, 'd-store/blogs');
    data.coverImage = { url: result.secure_url, publicId: result.public_id };
  }
  const blog = await Blog.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
  res.json({ success: true, blog });
});

exports.deleteBlog = asyncHandler(async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
  if (blog.coverImage?.publicId) await deleteFromCloudinary(blog.coverImage.publicId);
  await blog.deleteOne();
  res.json({ success: true, message: 'Blog deleted.' });
});

exports.getAllBlogsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const [blogs, total] = await Promise.all([
    Blog.find().populate('author', 'name').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Blog.countDocuments(),
  ]);
  res.json({ success: true, blogs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
