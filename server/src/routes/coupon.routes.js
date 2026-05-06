const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/coupon.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/validate', protect, ctrl.validateCoupon);
router.get('/', protect, adminOnly, ctrl.getCoupons);
router.post('/', protect, adminOnly, ctrl.createCoupon);
router.put('/:id', protect, adminOnly, ctrl.updateCoupon);
router.delete('/:id', protect, adminOnly, ctrl.deleteCoupon);

module.exports = router;
