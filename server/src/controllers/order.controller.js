const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const { calculateShippingFee } = require('./shipping.controller');
const { asyncHandler } = require('../middleware/errorHandler');
const { sendEmail } = require('../utils/email');
const { generateInvoicePDF } = require('../utils/invoice');

exports.createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, notes } = req.body;
  if (!items || items.length === 0) return res.status(400).json({ success: false, message: 'No items in order.' });

  let subtotal = 0;
  const enrichedItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) return res.status(400).json({ success: false, message: `Product not found.` });
    if (product.stock < item.quantity) return res.status(400).json({ success: false, message: `Insufficient stock for ${product.name}.` });

    const price = product.isOnSale && product.salePrice ? product.salePrice : product.price;
    subtotal += price * item.quantity;
    enrichedItems.push({ product: product._id, name: product.name, image: product.images?.[0]?.url || '', price, quantity: item.quantity, variant: item.variant || {}, gstRate: product.gstRate || 18 });
  }

  // Calculate dynamic shipping fee
  const shippingFee = await calculateShippingFee(items, shippingAddress?.state, subtotal);

  let discountAmount = 0;
  let couponData;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validation = coupon.isValid(req.user?._id, subtotal);
      if (!validation.valid) return res.status(400).json({ success: false, message: validation.message });
      discountAmount = coupon.calculateDiscount(subtotal);
      couponData = { code: coupon.code, discountType: coupon.type, discountValue: coupon.value };
      coupon.usedCount += 1;
      if (req.user) coupon.usedBy.push(req.user._id);
      await coupon.save();
    }
  }

  const gstAmount = Math.round(enrichedItems.reduce((acc, item) => {
    const base = item.price / (1 + item.gstRate / 100);
    return acc + (item.price - base) * item.quantity;
  }, 0) * 100) / 100;

  const codFee = (paymentMethod === 'partial_cod' || paymentMethod === 'cod') ? 50 : 0;
  const total = subtotal + shippingFee + codFee - discountAmount;

  let advanceAmount = 0;
  let codBalance = 0;
  if (paymentMethod === 'partial_cod') {
    advanceAmount = Math.round(codFee + shippingFee + 0.1 * (subtotal - discountAmount));
    codBalance = total - advanceAmount;
  } else if (paymentMethod === 'cod') {
    codBalance = total;
  }

  const order = await Order.create({
    user: req.user?._id || undefined, items: enrichedItems, shippingAddress, paymentMethod,
    subtotal, shippingFee, codFee, discountAmount, gstAmount, total, coupon: couponData, notes,
    advanceAmount, codBalance,
    statusHistory: [{ status: 'placed', message: 'Order placed successfully.' }],
  });

  for (const item of enrichedItems) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: -item.quantity, totalSold: item.quantity } });
  }

  const customerEmail = req.user ? req.user.email : shippingAddress.email;
  const customerName = req.user ? req.user.name : shippingAddress.fullName;
  if (customerEmail) {
    try { await sendEmail({ to: customerEmail, subject: `✅ Order Confirmed — ${order.orderNumber}`, template: 'orderConfirmed', data: { name: customerName, order } }); } catch (_) {}
  }
  res.status(201).json({ success: true, order });
});

exports.getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);
  res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  
  if (req.user.role === 'user') {
    if (!order.user || order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
  }

  res.json({ success: true, order });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email phone').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, message, trackingNumber, trackingUrl, courierPartner } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.status = status;
  order.statusHistory.push({ status, message: message || `Order ${status}.` });
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
  if (courierPartner) order.courierPartner = courierPartner;
  if (status === 'cancelled') {
    order.cancelledAt = new Date();
    for (const item of order.items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
  }
  await order.save();
  try {
    const emailTo = order.user ? order.user.email : order.shippingAddress.email;
    const nameTo = order.user ? order.user.name : order.shippingAddress.fullName;
    if (emailTo) {
      await sendEmail({ to: emailTo, subject: `📦 Order Update — ${order.orderNumber}`, template: 'orderStatusUpdate', data: { name: nameTo, order, status } });
    }
  } catch (_) {}
  res.json({ success: true, order });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (!['placed', 'confirmed'].includes(order.status)) return res.status(400).json({ success: false, message: 'Order cannot be cancelled at this stage.' });

  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.cancelledAt = new Date();
  order.statusHistory.push({ status: 'cancelled', message: order.cancelReason });
  for (const item of order.items) await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity, totalSold: -item.quantity } });
  await order.save();
  res.json({ success: true, message: 'Order cancelled.', order });
});

exports.downloadInvoice = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  
  if (req.user.role === 'user') {
    if (!order.user || order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }
  }

  if (!['paid', 'partially_paid'].includes(order.paymentStatus)) {
    return res.status(400).json({ success: false, message: 'Invoice is only available for confirmed payments.' });
  }

  const pdfBuffer = await generateInvoicePDF(order);
  res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=invoice-${order.orderNumber}.pdf` });
  res.send(pdfBuffer);
});
