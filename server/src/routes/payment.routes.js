const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/payment.controller');
const { protect, optionalAuth } = require('../middleware/auth');

const { adminOnly } = require('../middleware/admin');

// Standard endpoints (Step 1 & Step 3 aliases)
router.post('/create-order', optionalAuth, ctrl.createRazorpayOrder);
router.post('/verify-payment', optionalAuth, ctrl.verifyRazorpayPayment);
router.post('/verify', optionalAuth, ctrl.verifyRazorpayPayment);

// Razorpay specific routes
router.post('/razorpay/create-order', optionalAuth, ctrl.createRazorpayOrder);
router.post('/razorpay/verify', optionalAuth, ctrl.verifyRazorpayPayment);
router.post('/razorpay/sync', protect, adminOnly, ctrl.syncRazorpayPayments);
router.post('/stripe/create-intent', protect, ctrl.createStripeIntent);
// Stripe webhook uses raw body — must be registered before json parser in app.js
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), ctrl.stripeWebhook);

module.exports = router;
