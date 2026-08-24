const mongoose = require('mongoose');

const whatsappAddressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home',
  },
  recipientName: { type: String, required: true, trim: true },
  houseFlatBuilding: { type: String, required: true, trim: true },
  streetLocality: { type: String, required: true, trim: true },
  landmark: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  district: { type: String, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  country: { type: String, default: 'India', trim: true },
  phone: { type: String, required: true, trim: true },
  addressNotes: { type: String, trim: true },
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
