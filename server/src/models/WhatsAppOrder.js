const mongoose = require('mongoose');

const whatsappOrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  sku: { type: String, default: '' },
  variant: { type: String, default: '' },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  total: { type: Number, required: true, min: 0 },
});

const addressSnapshotSchema = new mongoose.Schema({
  type: String,
  recipientName: String,
  houseFlatBuilding: String,
  streetLocality: String,
  landmark: String,
  city: String,
  district: String,
  state: String,
  pincode: String,
  country: String,
  phone: String,
  addressNotes: String,
}, { _id: false });

const whatsappOrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true, index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'WhatsAppCustomer', required: true },
    customerName: { type: String, required: true, trim: true },
    whatsappNumber: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true },
    
    // Immutable address snapshot saved at creation time
    shippingAddressSnapshot: { type: addressSnapshotSchema, required: true },

    items: [whatsappOrderItemSchema],

    paymentDetails: {
      method: {
        type: String,
        enum: ['COD', 'UPI', 'Bank Transfer', 'Other'],
        default: 'COD',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      productAmount: { type: Number, required: true, default: 0 },
      discount: { type: Number, default: 0 },
      shippingCharge: { type: Number, default: 0 },
      otherCharges: { type: Number, default: 0 },
      grandTotal: { type: Number, required: true, default: 0 },
    },

    shippingInfo: {
      courierCompany: { type: String, default: '' },
      trackingNumber: { type: String, default: '', index: true },
      shippingCharge: { type: Number, default: 0 },
      shipmentDate: { type: Date },
      expectedDeliveryDate: { type: Date },
      trackingUrl: { type: String, default: '' },
      notes: { type: String, default: '' },
    },

    status: {
      type: String,
      enum: [
        'new',
        'confirmed',
        'processing',
        'packed',
        'shipped',
        'in_transit',
        'out_for_delivery',
        'delivered',
        'cancelled',
        'returned',
      ],
      default: 'new',
      index: true,
    },

    statusHistory: [
      {
        previousStatus: String,
        newStatus: String,
        message: String,
        updatedBy: {
          id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
          name: String,
        },
        timestamp: { type: Date, default: Date.now },
      },
    ],

    source: { type: String, default: 'whatsapp' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-generate order number (e.g. WA-1001, WA-1002, ...)
whatsappOrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('WhatsAppOrder').countDocuments();
    this.orderNumber = `WA-${1001 + count}`;
  }
  next();
});

whatsappOrderSchema.index({ customerName: 'text', whatsappNumber: 'text', orderNumber: 'text' });

const WhatsAppOrder = mongoose.model('WhatsAppOrder', whatsappOrderSchema);
module.exports = WhatsAppOrder;
