const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

// User profile
router.get('/profile', protect, ctrl.getProfile);
router.put('/profile', protect, upload.single('avatar'), ctrl.updateProfile);
router.put('/change-password', protect, ctrl.changePassword);

// Addresses
router.post('/addresses', protect, ctrl.addAddress);
router.put('/addresses/:addressId', protect, ctrl.updateAddress);
router.delete('/addresses/:addressId', protect, ctrl.deleteAddress);

// Wishlist
router.patch('/wishlist/:productId', protect, ctrl.toggleWishlist);

// Admin
router.get('/', protect, adminOnly, ctrl.getAllUsers);
router.patch('/:id/toggle-status', protect, adminOnly, ctrl.toggleUserStatus);

module.exports = router;
