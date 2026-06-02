const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  variant: {
    name: String,
    value: String,
  },
  gstRate: { type: Number, default: 18 },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [orderItemSchema],
    shippingAddress: { type: shippingAddressSchema, required: true },

    // Pricing
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    total: { type: Number, required: true },

    // Coupon
    coupon: {
      code: String,
      discountType: { type: String, enum: ['flat', 'percentage'] },
      discountValue: Number,
    },

    // Payment
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'stripe', 'cod', 'partial_cod'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'partially_paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: String,       // Razorpay/Stripe payment ID
    paymentOrderId: String,  // Razorpay order ID
    advanceAmount: { type: Number, default: 0 },
    codBalance: { type: Number, default: 0 },

    // Order status
    status: {
      type: String,
      enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
      default: 'placed',
    },

    // Tracking
    trackingNumber: String,
    trackingUrl: String,
    courierPartner: String,
    estimatedDelivery: Date,

    // History
    statusHistory: [
      {
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // Cancellation
    cancelReason: String,
    cancelledAt: Date,

    // Invoice
    invoiceUrl: String,
    invoiceNumber: String,

    notes: String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `TV${Date.now().toString().slice(-6)}${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });

const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
