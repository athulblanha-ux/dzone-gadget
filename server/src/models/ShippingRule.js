const mongoose = require('mongoose');

const shippingRuleSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    // "Default" will be used as a fallback for any unconfigured states
  },
  baseFee: {
    type: Number,
    required: true,
    default: 49,
    min: 0,
  },
  freeShippingThreshold: {
    type: Number,
    required: true,
    default: 499,
    min: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('ShippingRule', shippingRuleSchema);
