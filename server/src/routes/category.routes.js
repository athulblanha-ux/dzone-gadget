const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/category.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', ctrl.getCategories);
router.get('/:slug', ctrl.getCategory);
router.post('/', protect, adminOnly, upload.single('image'), ctrl.createCategory);
router.put('/:id', protect, adminOnly, upload.single('image'), ctrl.updateCategory);
router.delete('/:id', protect, adminOnly, ctrl.deleteCategory);
router.patch('/reorder', protect, adminOnly, ctrl.reorderCategories);

module.exports = router;
