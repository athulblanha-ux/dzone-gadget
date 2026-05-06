const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    type: { type: String, enum: ['flat', 'percentage'], required: true },
    value: { type: Number, required: true, min: 1 },
    maxDiscount: Number, // Cap for percentage coupons
    minOrderAmount: { type: Number, default: 0 },
    maxUses: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    isActive: { type: Boolean, default: true },
    applicableCategories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
    applicableProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    expiresAt: { type: Date, required: true },
    startsAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

couponSchema.methods.isValid = function (userId, orderAmount) {
  const now = new Date();
  if (!this.isActive) return { valid: false, message: 'Coupon is not active.' };
  if (now < this.startsAt) return { valid: false, message: 'Coupon is not yet active.' };
  if (now > this.expiresAt) return { valid: false, message: 'Coupon has expired.' };
  if (this.maxUses && this.usedCount >= this.maxUses) return { valid: false, message: 'Coupon usage limit reached.' };
  if (this.usedBy.includes(userId)) return { valid: false, message: 'You have already used this coupon.' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}.` };
  return { valid: true };
};

couponSchema.methods.calculateDiscount = function (amount) {
  if (this.type === 'flat') return Math.min(this.value, amount);
  const discount = (amount * this.value) / 100;
  return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
};

const Coupon = mongoose.model('Coupon', couponSchema);
module.exports = Coupon;
