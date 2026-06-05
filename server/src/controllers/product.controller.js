const Product = require('../models/Product');
const { asyncHandler } = require('../middleware/errorHandler');
const { uploadToCloudinary, deleteFromCloudinary } = require('../config/cloudinary');

/**
 * Build filter query from request query params
 */
const buildProductFilter = (query) => {
  const filter = { isActive: true };

  if (query.id) {
    const ids = Array.isArray(query.id) ? query.id : [query.id];
    filter._id = { $in: ids };
  }
  if (query.category) filter.category = query.category;
  if (query.isFeatured) filter.isFeatured = query.isFeatured === 'true';
  if (query.isTrending) filter.isTrending = query.isTrending === 'true';
  if (query.isNewArrival) filter.isNewArrival = query.isNewArrival === 'true';
  if (query.ageGroup) filter.ageGroup = query.ageGroup;
  if (query.brand) filter.brand = { $regex: query.brand, $options: 'i' };

  // Price range
  if (query.minPrice || query.maxPrice) {
    filter.price = {};
    if (query.minPrice) filter.price.$gte = Number(query.minPrice);
    if (query.maxPrice) filter.price.$lte = Number(query.maxPrice);
  }

  // Rating
  if (query.minRating) {
    filter['ratings.average'] = { $gte: Number(query.minRating) };
  }

  // Full text search
  if (query.search) {
    filter.$text = { $search: query.search };
  }

  // Stock
  if (query.inStock === 'true') filter.stock = { $gt: 0 };

  return filter;
};

/**
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = asyncHandler(async (req, res) => {
  const all = req.query.all === 'true' || req.query.limit === 'all';
  const page = all ? 1 : (parseInt(req.query.page) || 1);
  const limit = all ? 1000000 : Math.min(parseInt(req.query.limit) || 12, 100);
  const skip = all ? 0 : (page - 1) * limit;

  // Sort
  const sortOptions = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popular: { totalSold: -1 },
    rating: { 'ratings.average': -1 },
    relevance: req.query.search ? { score: { $meta: 'textScore' } } : { createdAt: -1 },
  };
  const sort = sortOptions[req.query.sort] || { createdAt: -1 };

  const filter = buildProductFilter(req.query);

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('-__v')
      .populate('category', 'name slug')
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(filter),
  ]);

  res.json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

/**
 * @route   GET /api/products/:slugOrId
 * @access  Public
 */
exports.getProduct = asyncHandler(async (req, res) => {
  const { slugOrId } = req.params;
  const isId = slugOrId.match(/^[0-9a-fA-F]{24}$/);
  const query = isId ? { _id: slugOrId } : { slug: slugOrId };

  const product = await Product.findOne({ ...query, isActive: true })
    .populate('category', 'name slug')
    .populate('subCategory', 'name slug');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found.' });
  }

  // Get related products (same category, excluding self)
  const related = await Product.find({
    category: product.category._id,
    _id: { $ne: product._id },
    isActive: true,
  })
    .select('name slug price salePrice images ratings')
    .limit(8)
    .lean();

  res.json({ success: true, product, related });
});

/**
 * @route   POST /api/products
 * @access  Admin
 */
exports.createProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  data.images = [];

  // Upload images to Cloudinary
  if (req.files?.images?.length) {
    const uploadPromises = req.files.images.map((file) =>
      uploadToCloudinary(file.buffer, 'd-store/products')
    );
    const results = await Promise.all(uploadPromises);
    data.images = results.map((r, i) => ({
      url: r.secure_url,
      publicId: r.public_id,
      alt: req.body.name || `Product image ${i + 1}`,
    }));
  }

  // Upload video to Cloudinary
  if (req.files?.video?.[0]) {
    const result = await uploadToCloudinary(req.files.video[0].buffer, 'd-store/products/videos');
    data.video = {
      url: result.secure_url,
      publicId: result.public_id,
    };
  }

  // Parse JSON fields from form data
  if (typeof data.variants === 'string') data.variants = JSON.parse(data.variants);
  if (typeof data.tags === 'string') data.tags = JSON.parse(data.tags);

  const product = await Product.create(data);
  res.status(201).json({ success: true, product });
});

/**
 * @route   PUT /api/products/:id
 * @access  Admin
 */
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  const data = { ...req.body };

  // Handle existing images and deletions
  let existingImages = product.images || [];
  if (req.body.existingImages) {
    try {
      const parsedExisting = JSON.parse(req.body.existingImages);
      const keptPublicIds = new Set(parsedExisting.map(img => img.publicId || img.public_id).filter(Boolean));
      
      // Delete removed images from Cloudinary
      const removedImages = (product.images || []).filter(img => img.publicId && !keptPublicIds.has(img.publicId));
      for (const img of removedImages) {
        await deleteFromCloudinary(img.publicId);
      }
      
      existingImages = parsedExisting.map(img => ({
        url: img.url,
        publicId: img.publicId || img.public_id,
        alt: img.alt || product.name
      }));
      
      product.images = existingImages;
      product.markModified('images');
    } catch (err) {
      console.error("Error parsing existingImages:", err);
    }
  }

  // Upload new images if provided
  if (req.files?.images?.length) {
    const uploadPromises = req.files.images.map((file) =>
      uploadToCloudinary(file.buffer, 'd-store/products')
    );
    const results = await Promise.all(uploadPromises);
    const newImages = results.map((r, i) => ({
      url: r.secure_url,
      publicId: r.public_id,
      alt: req.body.name || product.name || `Product image ${existingImages.length + i + 1}`
    }));
    product.images = [...existingImages, ...newImages];
    product.markModified('images');
  }

  // Upload new video if provided
  if (req.files?.video?.[0]) {
    // Delete old video if exists
    if (product.video?.publicId) {
      await deleteFromCloudinary(product.video.publicId);
    }
    const result = await uploadToCloudinary(req.files.video[0].buffer, 'd-store/products/videos');
    product.video = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    product.markModified('video');
  } else if (req.body.removeVideo === 'true') {
    if (product.video?.publicId) {
      await deleteFromCloudinary(product.video.publicId);
    }
    product.video = null;
    product.markModified('video');
  }

  // Copy other fields to the product document
  Object.entries(req.body).forEach(([key, val]) => {
    if (
      key !== 'images' && 
      key !== 'existingImages' && 
      key !== 'video' && 
      key !== 'removeVideo' && 
      key !== '_id'
    ) {
      if (key === 'variants' && typeof val === 'string') {
        try {
          product[key] = JSON.parse(val);
        } catch (e) {
          console.error("Failed to parse variants:", e);
        }
      } else if (key === 'tags' && typeof val === 'string') {
        try {
          product[key] = JSON.parse(val);
        } catch (e) {
          console.error("Failed to parse tags:", e);
        }
      } else {
        product[key] = val;
      }
    }
  });

  const updated = await product.save();

  res.json({ success: true, product: updated });
});

/**
 * @route   DELETE /api/products/:id/images/:publicId
 * @access  Admin — remove a single image from a product
 */
exports.deleteProductImage = asyncHandler(async (req, res) => {
  const { id, publicId } = req.params;
  const decodedId = decodeURIComponent(publicId);

  await deleteFromCloudinary(decodedId);
  await Product.findByIdAndUpdate(id, {
    $pull: { images: { publicId: decodedId } },
  });

  res.json({ success: true, message: 'Image removed.' });
});

/**
 * @route   DELETE /api/products/:id
 * @access  Admin
 */
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });

  // Delete images from Cloudinary
  const deletePromises = product.images
    .filter((img) => img.publicId)
    .map((img) => deleteFromCloudinary(img.publicId));
  await Promise.all(deletePromises);

  await product.deleteOne();
  res.json({ success: true, message: 'Product deleted successfully.' });
});

/**
 * @route   PATCH /api/products/:id/toggle-featured
 * @access  Admin
 */
exports.toggleFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  product.isFeatured = !product.isFeatured;
  await product.save();
  res.json({ success: true, isFeatured: product.isFeatured });
});

/**
 * @route   PATCH /api/products/:id/stock
 * @access  Admin
 */
exports.updateStock = asyncHandler(async (req, res) => {
  const { stock } = req.body;
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { stock },
    { new: true, runValidators: true }
  );
  if (!product) return res.status(404).json({ success: false, message: 'Product not found.' });
  res.json({ success: true, stock: product.stock });
});

/**
 * @route   GET /api/products/admin/all
 * @access  Admin — includes inactive products
 */
exports.getAllProductsAdmin = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search ? { $text: { $search: req.query.search } } : {};

  const [products, total] = await Promise.all([
    Product.find(search)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(search),
  ]);

  res.json({ success: true, products, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});
