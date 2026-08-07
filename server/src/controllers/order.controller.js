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

  const gstAmount = 0;

  const codFee = (paymentMethod === 'partial_cod' || paymentMethod === 'cod') ? 90 : 0;
  const total = subtotal + shippingFee + codFee - discountAmount;

  let advanceAmount = 0;
  let codBalance = 0;
  if (paymentMethod === 'partial_cod') {
    advanceAmount = Math.round(codFee + shippingFee + 0.3 * (subtotal - discountAmount));
    codBalance = total - advanceAmount;
  } else if (paymentMethod === 'cod') {
    codBalance = total;
  }

  const orderStatus = paymentMethod === 'cod' ? 'confirmed' : 'placed';
  const order = await Order.create({
    user: req.user?._id || undefined, items: enrichedItems, shippingAddress, paymentMethod,
    subtotal, shippingFee, codFee, discountAmount, gstAmount, total, coupon: couponData, notes,
    advanceAmount, codBalance,
    status: orderStatus,
    statusHistory: [{ status: orderStatus, message: orderStatus === 'confirmed' ? 'Order confirmed (COD).' : 'Order placed successfully.' }],
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
  const filter = { 
    user: req.user._id,
    $nor: [
      { status: 'placed', paymentStatus: 'pending' }
    ]
  };
  const [orders, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Order.countDocuments(filter),
  ]);
  res.json({ success: true, orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
});

exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  
  // Admin bypass
  if (req.user && req.user.role === 'admin') {
    return res.json({ success: true, order });
  }

  // Check if owner
  const isOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();
  // Check if payment is confirmed
  const isConfirmedPayment = ['paid', 'partially_paid'].includes(order.paymentStatus);

  if (isOwner || isConfirmedPayment) {
    return res.json({ success: true, order });
  }

  return res.status(403).json({ success: false, message: 'Access denied.' });
});

exports.getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const filter = { status: { $ne: 'placed' } };
  if (req.query.status) {
    filter.status = req.query.status;
  }

  if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

  if (req.query.search) {
    const searchRegex = new RegExp(req.query.search, 'i');
    filter.$or = [
      { orderNumber: searchRegex },
      { paymentId: searchRegex },
      { paymentOrderId: searchRegex },
      { 'shippingAddress.fullName': searchRegex },
      { 'shippingAddress.phone': searchRegex },
      { 'shippingAddress.email': searchRegex }
    ];
  }

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
  
  if (['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'].includes(status)) {
    if (order.paymentStatus === 'pending') {
      if (order.paymentMethod === 'partial_cod') {
        order.paymentStatus = 'partially_paid';
      } else if (order.paymentMethod === 'razorpay' || order.paymentMethod === 'stripe') {
        order.paymentStatus = 'paid';
      }
    }
  }

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
  
  // Admin bypass
  const isAdmin = req.user && req.user.role === 'admin';
  // Check if owner
  const isOwner = req.user && order.user && order.user._id.toString() === req.user._id.toString();
  // Check if payment is confirmed
  const isConfirmedPayment = ['paid', 'partially_paid'].includes(order.paymentStatus);

  if (isAdmin || isOwner || isConfirmedPayment) {
    if (!isConfirmedPayment) {
      return res.status(400).json({ success: false, message: 'Invoice is only available for confirmed payments.' });
    }

    const pdfBuffer = await generateInvoicePDF(order);
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename=invoice-${order.orderNumber}.pdf` });
    return res.send(pdfBuffer);
  }

  return res.status(403).json({ success: false, message: 'Access denied.' });
});

exports.updateOrderTracking = asyncHandler(async (req, res) => {
  const { courierPartner, trackingNumber, trackingUrl } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  order.courierPartner = courierPartner;
  order.trackingNumber = trackingNumber;
  order.trackingUrl = trackingUrl;

  await order.save();
  res.json({ success: true, order });
});

exports.debugDumpYesterday = asyncHandler(async (req, res) => {
  // Query all orders created in the last 48 hours to fully cover yesterday
  const timeLimit = new Date(Date.now() - 48 * 60 * 60 * 1000);
  
  const orders = await Order.find({
    createdAt: { $gte: timeLimit }
  }).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    count: orders.length,
    orders: orders.map(o => ({
      orderNumber: o.orderNumber,
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: o.total,
      advanceAmount: o.advanceAmount,
      codBalance: o.codBalance,
      paymentId: o.paymentId,
      paymentOrderId: o.paymentOrderId,
      customer: {
        name: o.shippingAddress?.fullName,
        email: o.shippingAddress?.email,
        phone: o.shippingAddress?.phone,
        address: `${o.shippingAddress?.addressLine1 || ''}, ${o.shippingAddress?.addressLine2 || ''}, ${o.shippingAddress?.city || ''}, ${o.shippingAddress?.state || ''} - ${o.shippingAddress?.pincode || ''}`
      },
      products: o.items?.map(i => `${i.name} (x${i.quantity})`).join(', '),
      createdAt: o.createdAt
    }))
  });
});
