const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, maxlength: 200 },
    comment: { type: String, required: true, maxlength: 1000 },
    images: [{ url: String, publicId: String }],
    isApproved: { type: Boolean, default: false },
    isVerifiedPurchase: { type: Boolean, default: false },
    helpfulVotes: { type: Number, default: 0 },
    reportCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// One review per user per product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });
reviewSchema.index({ product: 1, isApproved: 1 });

// Auto-update product ratings after save/delete
const updateProductRatings = async (productId) => {
  const Review = mongoose.model('Review');
  const Product = mongoose.model('Product');
  const stats = await Review.aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      'ratings.average': Math.round(stats[0].avgRating * 10) / 10,
      'ratings.count': stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { 'ratings.average': 0, 'ratings.count': 0 });
  }
};

reviewSchema.post('save', function () {
  updateProductRatings(this.product);
});
reviewSchema.post('deleteOne', { document: true }, function () {
  updateProductRatings(this.product);
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
