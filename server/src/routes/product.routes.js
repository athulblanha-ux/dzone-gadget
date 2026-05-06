const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/product.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

// Public routes
router.get('/', ctrl.getProducts);
router.get('/admin/all', protect, adminOnly, ctrl.getAllProductsAdmin);
router.get('/:slugOrId', ctrl.getProduct);

// Admin routes
router.post('/', protect, adminOnly, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), ctrl.createProduct);
router.put('/:id', protect, adminOnly, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'video', maxCount: 1 }]), ctrl.updateProduct);
router.delete('/:id', protect, adminOnly, ctrl.deleteProduct);
router.delete('/:id/images/:publicId', protect, adminOnly, ctrl.deleteProductImage);
router.patch('/:id/toggle-featured', protect, adminOnly, ctrl.toggleFeatured);
router.patch('/:id/stock', protect, adminOnly, ctrl.updateStock);

module.exports = router;
