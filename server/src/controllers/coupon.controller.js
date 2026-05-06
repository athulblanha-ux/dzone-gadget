const Coupon = require('../models/Coupon');
const { asyncHandler } = require('../middleware/errorHandler');

exports.getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
  res.json({ success: true, coupons });
});

exports.validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
  const validation = coupon.isValid(req.user._id, orderAmount);
  if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });
  const discount = coupon.calculateDiscount(orderAmount);
  res.json({ success: true, coupon: { code: coupon.code, type: coupon.type, value: coupon.value, discount } });
});

exports.createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, coupon });
});

exports.updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) return res.status(404).json({ success: false, message: 'Coupon not found.' });
  res.json({ success: true, coupon });
});

exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Coupon deleted.' });
});
