const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/review.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/product/:productId', ctrl.getProductReviews);
router.post('/product/:productId', protect, ctrl.createReview);
router.get('/admin/all', protect, adminOnly, ctrl.getAllReviewsAdmin);
router.patch('/:id/approve', protect, adminOnly, ctrl.approveReview);
router.delete('/:id', protect, adminOnly, ctrl.deleteReview);

module.exports = router;
