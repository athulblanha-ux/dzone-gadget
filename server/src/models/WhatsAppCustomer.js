const mongoose = require('mongoose');

const whatsappAddressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home',
  },
  recipientName: { type: String, default: '', trim: true },
  houseFlatBuilding: { type: String, default: '', trim: true },
  streetLocality: { type: String, default: '', trim: true },
  landmark: { type: String, default: '', trim: true },
  city: { type: String, default: '', trim: true },
  district: { type: String, default: '', trim: true },
  state: { type: String, default: '', trim: true },
  pincode: { type: String, default: '', trim: true },
  country: { type: String, default: 'India', trim: true },
  phone: { type: String, default: '', trim: true },
  addressNotes: { type: String, default: '', trim: true },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const whatsappCustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Customer name is required'], trim: true },
    whatsappNumber: {
      type: String,
      required: [true, 'WhatsApp number is required'],
      unique: true,
      trim: true,
      index: true,
    },
    email: { type: String, trim: true, lowercase: true },
    addresses: [whatsappAddressSchema],
    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

whatsappCustomerSchema.index({ whatsappNumber: 1, name: 1 });

const WhatsAppCustomer = mongoose.model('WhatsAppCustomer', whatsappCustomerSchema);
module.exports = WhatsAppCustomer;
