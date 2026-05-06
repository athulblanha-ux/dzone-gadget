const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/banner.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', ctrl.getBanners);
router.get('/admin/all', protect, adminOnly, ctrl.getAllBannersAdmin);
router.post('/', protect, adminOnly, upload.single('image'), ctrl.createBanner);
router.put('/:id', protect, adminOnly, upload.single('image'), ctrl.updateBanner);
router.delete('/:id', protect, adminOnly, ctrl.deleteBanner);

module.exports = router;
