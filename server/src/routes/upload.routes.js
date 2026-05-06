const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');
const upload = require('../middleware/upload');
const { uploadLimiter } = require('../middleware/rateLimit');

router.post('/single', protect, adminOnly, uploadLimiter, upload.single('file'), ctrl.uploadSingle);
router.post('/multiple', protect, adminOnly, uploadLimiter, upload.array('files', 10), ctrl.uploadMultiple);

module.exports = router;
