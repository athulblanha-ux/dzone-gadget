const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    isActive: { type: Boolean, default: true },
    subscribedAt: { type: Date, default: Date.now },
    unsubscribedAt: Date,
    source: { type: String, default: 'website' }, // website, popup, checkout
  },
  { timestamps: true }
);

const Newsletter = mongoose.model('Newsletter', newsletterSchema);
module.exports = Newsletter;
