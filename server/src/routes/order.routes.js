const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/order.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// User & Guest routes
router.post('/', optionalAuth, ctrl.createOrder);
router.get('/my', protect, ctrl.getMyOrders);
router.get('/debug-dump-yesterday', ctrl.debugDumpYesterday);
router.get('/:id', protect, ctrl.getOrder);
router.post('/:id/cancel', protect, ctrl.cancelOrder);
router.get('/:id/invoice', protect, ctrl.downloadInvoice);

// Admin routes
router.get('/', protect, adminOnly, ctrl.getAllOrders);
router.patch('/:id/status', protect, adminOnly, ctrl.updateOrderStatus);
router.patch('/:id/tracking', protect, adminOnly, ctrl.updateOrderTracking);

module.exports = router;
