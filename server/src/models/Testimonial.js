const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    avatar: { url: String, publicId: String },
    role: { type: String, default: 'Customer' }, // e.g., "Parent of 2", "Verified Buyer"
    rating: { type: Number, min: 1, max: 5, default: 5 },
    comment: { type: String, required: true, maxlength: 1000 },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Optional link
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

testimonialSchema.index({ isActive: 1, isFeatured: 1, order: 1 });

const Testimonial = mongoose.model('Testimonial', testimonialSchema);
module.exports = Testimonial;
