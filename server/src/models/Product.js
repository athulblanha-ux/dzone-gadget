const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema({
  name: { type: String, required: true },      // e.g., "Color", "Size"
  options: [
    {
      value: { type: String, required: true }, // e.g., "Red", "Small"
      price: Number,                           // Override price for this variant
      stock: { type: Number, default: 0 },
      sku: String,
    },
  ],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: 200 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String, maxlength: 500 },
    price: { type: Number, required: [true, 'Price is required'], min: 0 },
    salePrice: { type: Number, min: 0 },
    isOnSale: { type: Boolean, default: false },
    saleEndsAt: Date,
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        alt: String,
      },
    ],
    video: {
      url: String,
      publicId: String,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
    tags: [{ type: String, lowercase: true }],
    brand: { type: String, trim: true },
    sku: { type: String, unique: true, sparse: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    variants: [variantSchema],
    ratings: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    isTrending: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    ageGroup: {
      type: String,
      enum: ['0-2', '3-5', '6-8', '9-12', '13+', 'all'],
      default: 'all',
    },
    weight: Number, // in grams, for shipping calculation
    deliveryCharge: { type: Number, default: 0, min: 0 },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    gstRate: { type: Number, default: 18 }, // GST percentage
    metaTitle: String,
    metaDescription: String,
    totalSold: { type: Number, default: 0 },
    instagramPostId: String, // Link to Instagram post
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  // Set isOnSale based on salePrice
  this.isOnSale = !!this.salePrice && this.salePrice < this.price;
  next();
});

// Virtual: discount percentage
productSchema.virtual('discountPercent').get(function () {
  if (this.isOnSale && this.salePrice) {
    return Math.round(((this.price - this.salePrice) / this.price) * 100);
  }
  return 0;
});

// Virtual: isLowStock
productSchema.virtual('isLowStock').get(function () {
  return this.stock <= this.lowStockThreshold && this.stock > 0;
});

// Virtual: isOutOfStock
productSchema.virtual('isOutOfStock').get(function () {
  return this.stock === 0;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Indexes for search and filtering
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ isTrending: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ totalSold: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ order: 1 });

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
