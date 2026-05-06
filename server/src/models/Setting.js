const mongoose = require('mongoose');

/**
 * Dynamic key-value settings store for site configuration.
 * Admins can update text, policies, contact details, etc. without code changes.
 */
const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    label: { type: String },           // Human-readable label for admin UI
    group: { type: String, default: 'general' }, // Group: general, seo, contact, social, payment
    type: {
      type: String,
      enum: ['text', 'textarea', 'number', 'boolean', 'image', 'json', 'color'],
      default: 'text',
    },
    isPublic: { type: Boolean, default: true }, // Expose to frontend API
  },
  { timestamps: true }
);

settingSchema.index({ group: 1 });

const Setting = mongoose.model('Setting', settingSchema);
module.exports = Setting;
