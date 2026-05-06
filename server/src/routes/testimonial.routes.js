const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/testimonial.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');

router.get('/', ctrl.getTestimonials);
router.post('/', protect, adminOnly, upload.single('avatar'), ctrl.createTestimonial);
router.put('/:id', protect, adminOnly, ctrl.updateTestimonial);
router.delete('/:id', protect, adminOnly, ctrl.deleteTestimonial);

module.exports = router;
