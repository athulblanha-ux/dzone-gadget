const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    subtitle: String,
    ctaText: String,
    ctaLink: String,
    image: {
      url: { type: String, required: true },
      publicId: String,
    },
    mobileImage: {
      url: String,
      publicId: String,
    },
    position: {
      type: String,
      enum: ['hero', 'mid', 'bottom', 'popup', 'sidebar'],
      default: 'hero',
    },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    backgroundColor: String,
    textColor: String,
    scheduledStart: Date,
    scheduledEnd: Date,
  },
  { timestamps: true }
);

bannerSchema.index({ position: 1, isActive: 1, order: 1 });

const Banner = mongoose.model('Banner', bannerSchema);
module.exports = Banner;
