const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blog.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', ctrl.getBlogs);
router.get('/admin/all', protect, adminOnly, ctrl.getAllBlogsAdmin);
router.get('/:slug', ctrl.getBlog);
router.post('/', protect, adminOnly, upload.single('coverImage'), ctrl.createBlog);
router.put('/:id', protect, adminOnly, upload.single('coverImage'), ctrl.updateBlog);
router.delete('/:id', protect, adminOnly, ctrl.deleteBlog);

module.exports = router;
