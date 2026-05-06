const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true },
    category: {
      type: String,
      enum: ['general', 'orders', 'payments', 'shipping', 'returns', 'products'],
      default: 'general',
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

faqSchema.index({ category: 1, order: 1 });

const FAQ = mongoose.model('FAQ', faqSchema);
module.exports = FAQ;
