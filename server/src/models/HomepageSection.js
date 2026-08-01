const mongoose = require('mongoose');

const homepageSectionSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'hero_banner',
        'featured_categories',
        'featured_products',
        'trending_products',
        'new_arrivals',
        'flash_sale',
        'instagram_feed',
        'promotional_banner',
        'testimonials',
        'newsletter',
        'brands',
        'custom_html',
      ],
      required: true,
    },
    title: String,
    subtitle: String,
    backgroundImage: {
      url: String,
      publicId: String,
    },
    backgroundColor: String,
    content: mongoose.Schema.Types.Mixed, // Flexible: product IDs, HTML, etc.
    settings: mongoose.Schema.Types.Mixed, // e.g., { limit: 8, showTimer: true }
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

homepageSectionSchema.index({ isActive: 1, order: 1 });

const HomepageSection = mongoose.model('HomepageSection', homepageSectionSchema);
module.exports = HomepageSection;
