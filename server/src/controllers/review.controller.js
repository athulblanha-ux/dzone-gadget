const Review = require('../models/Review');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getProductReviews = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const [reviews, total] = await Promise.all([
    Review.find({ product: req.params.productId, isApproved: true })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Review.countDocuments({ product: req.params.productId, isApproved: true }),
  ]);
  res.json({ success: true, reviews, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  // Check if already reviewed
  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) return res.status(409).json({ success: false, message: 'You have already reviewed this product.' });

  // Check verified purchase
  const purchasedOrder = await Order.findOne({ user: req.user._id, 'items.product': productId, paymentStatus: 'paid' });

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating: req.body.rating,
    title: req.body.title,
    comment: req.body.comment,
    isVerifiedPurchase: !!purchasedOrder,
    isApproved: false, // Admin approval required
  });

  res.status(201).json({ success: true, review, message: 'Review submitted and pending approval.' });
});

exports.approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
  res.json({ success: true, review });
});

exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted.' });
});

exports.getAllReviewsAdmin = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.approved === 'false') filter.isApproved = false;
  const reviews = await Review.find(filter).populate('user', 'name email').populate('product', 'name').sort({ createdAt: -1 }).lean();
  res.json({ success: true, reviews });
});
