const mongoose = require('mongoose');
const slugify = require('slugify');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Category name is required'], trim: true, maxlength: 100 },
    slug: { type: String, unique: true, lowercase: true },
    description: String,
    image: {
      url: { type: String, default: '' },
      publicId: String,
    },
    icon: String, // emoji or icon class
    parent: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', default: null },
    order: { type: Number, default: 0 }, // display order
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    metaTitle: String,
    metaDescription: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate slug
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

// Virtual: subcategories (populated on demand)
categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

categorySchema.index({ parent: 1, isActive: 1 });
categorySchema.index({ order: 1 });

const Category = mongoose.model('Category', categorySchema);
module.exports = Category;
