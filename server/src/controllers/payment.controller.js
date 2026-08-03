const Razorpay = require('razorpay');
const Stripe = require('stripe');
const crypto = require('crypto');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');

// Lazily initialize Stripe so missing keys don't crash startup
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

exports.createRazorpayOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.body.orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_stubkey123';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_stubsecret123';
  const isMock = keyId.startsWith('rzp_test_stub');

  const amountToPay = order.paymentMethod === 'partial_cod' ? order.advanceAmount : order.total;

  if (isMock) {
    const mockOrderId = `order_mock_${Math.random().toString(36).substr(2, 9)}`;
    order.paymentOrderId = mockOrderId;
    await order.save();
    return res.json({
      success: true,
      razorpayOrderId: mockOrderId,
      amount: Math.round(amountToPay * 100),
      currency: 'INR',
      keyId: keyId,
      isMock: true
    });
  }

  // Real Razorpay integration
  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  const rzpOrder = await razorpay.orders.create({ amount: Math.round(amountToPay * 100), currency: 'INR', receipt: order.orderNumber });
  order.paymentOrderId = rzpOrder.id;
  await order.save();
  res.json({ success: true, razorpayOrderId: rzpOrder.id, amount: rzpOrder.amount, currency: 'INR', keyId: keyId });
});

exports.verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;
  
  const keyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_stubkey123';
  const keySecret = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_stubsecret123';
  const isMock = keyId.startsWith('rzp_test_stub') || razorpay_order_id?.startsWith('order_mock_');

  if (!isMock) {
    const expected = crypto.createHmac('sha256', keySecret).update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    if (expected !== razorpay_signature) return res.status(400).json({ success: false, message: 'Payment verification failed.' });
  }

  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  if (order.paymentMethod === 'partial_cod') {
    order.paymentStatus = 'partially_paid';
  } else {
    order.paymentStatus = 'paid';
  }
  order.paymentId = razorpay_payment_id || `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
  order.status = 'confirmed';
  order.statusHistory.push({ 
    status: 'confirmed', 
    message: order.paymentMethod === 'partial_cod' 
      ? `Partial COD advance of ₹${order.advanceAmount} received via Razorpay${isMock ? ' (Mock Mode)' : ''}. Remaining ₹${order.codBalance} COD due on delivery.`
      : `Payment received via Razorpay${isMock ? ' (Mock Mode)' : ''}.` 
  });
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

exports.syncRazorpayPayments = asyncHandler(async (req, res) => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(400).json({ success: false, message: 'Razorpay credentials missing.' });
  }

  const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });
  
  // Fetch payments from the last 7 days to cover any recent mismatches
  const sevenDaysAgo = Math.floor((Date.now() - 7 * 24 * 60 * 60 * 1000) / 1000);
  
  const response = await razorpay.payments.all({
    from: sevenDaysAgo,
    count: 100
  });

  const payments = response.items || [];
  let updatedCount = 0;

  for (const payment of payments) {
    if (payment.status !== 'captured' && payment.status !== 'authorized') {
      continue;
    }

    const paymentId = payment.id;
    const paymentOrderId = payment.order_id;
    const amount = payment.amount / 100;

    // Find matching order in DB
    const order = await Order.findOne({
      $or: [
        { paymentOrderId: paymentOrderId },
        { orderNumber: payment.receipt }
      ]
    });

    if (order) {
      let changed = false;

      // Update payment details if missing
      if (!order.paymentId || order.paymentId !== paymentId) {
        order.paymentId = paymentId;
        changed = true;
      }
      if (!order.paymentOrderId || order.paymentOrderId !== paymentOrderId) {
        order.paymentOrderId = paymentOrderId;
        changed = true;
      }

      // Update payment status if pending
      if (order.paymentStatus === 'pending') {
        order.paymentStatus = order.paymentMethod === 'partial_cod' ? 'partially_paid' : 'paid';
        changed = true;
      }

      // Update order status if still placed
      if (order.status === 'placed') {
        order.status = 'confirmed';
        if (!order.statusHistory) order.statusHistory = [];
        order.statusHistory.push({
          status: 'confirmed',
          message: `Order confirmed automatically via Razorpay Sync. Received ₹${amount} online.`
        });
        changed = true;
      }

      if (changed) {
        await order.save();
        updatedCount++;
      }
    }
  }

  res.json({
    success: true,
    message: `Payment sync complete! Successfully reconciled and updated ${updatedCount} orders.`,
    updatedCount
  });
});
