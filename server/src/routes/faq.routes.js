const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/faq.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', ctrl.getFAQs);
router.post('/', protect, adminOnly, ctrl.createFAQ);
router.put('/:id', protect, adminOnly, ctrl.updateFAQ);
router.delete('/:id', protect, adminOnly, ctrl.deleteFAQ);

module.exports = router;
