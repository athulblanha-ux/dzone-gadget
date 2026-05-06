const Razorpay = require('razorpay');
const Stripe = require('stripe');
const crypto = require('crypto');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// Lazily initialize payment clients so missing/demo keys don't crash startup
const getRazorpay = () => new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const razorpay = getRazorpay();
  const order = await Order.findById(req.body.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  const rzpOrder = await razorpay.orders.create({ amount: Math.round(order.total * 100), currency: 'INR', receipt: order.orderNumber });
  order.paymentOrderId = rzpOrder.id;
  await order.save();
  res.json({ success: true, razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID });
});

exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ success: false, message: 'Payment verification failed.' });
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  order.paymentStatus = 'paid';
  order.paymentId = razorpay_payment_id;
  order.status = 'confirmed';
  order.statusHistory.push({ status: 'confirmed', message: 'Payment received via Razorpay.' });
  await order.save();
  res.json({ success: true, message: 'Payment verified.', order });
});

exports.createStripeIntent = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const order = await Order.findById(req.body.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  const intent = await stripe.paymentIntents.create({ amount: Math.round(order.total * 100), currency: 'inr', metadata: { orderId: order._id.toString() } });
  order.paymentOrderId = intent.id;
  await order.save();
  res.json({ success: true, clientSecret: intent.client_secret });
});

exports.stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  let event;
  try { event = stripe.webhooks.constructEvent(req.body, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET); }
  catch (err) { return res.status(400).json({ success: false, message: err.message }); }
  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object;
    const order = await Order.findById(intent.metadata.orderId);
    if (order) { order.paymentStatus = 'paid'; order.paymentId = intent.id; order.status = 'confirmed'; order.statusHistory.push({ status: 'confirmed', message: 'Payment via Stripe.' }); await order.save(); }
  }
  res.json({ received: true });
});
