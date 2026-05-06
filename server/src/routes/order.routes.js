const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/order.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

// User routes
router.post('/', protect, ctrl.createOrder);
router.get('/my', protect, ctrl.getMyOrders);
router.get('/:id', protect, ctrl.getOrder);
router.post('/:id/cancel', protect, ctrl.cancelOrder);
router.get('/:id/invoice', protect, ctrl.downloadInvoice);

// Admin routes
router.get('/', protect, adminOnly, ctrl.getAllOrders);
router.patch('/:id/status', protect, adminOnly, ctrl.updateOrderStatus);

module.exports = router;
