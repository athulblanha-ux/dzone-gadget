const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/newsletter.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/subscribe', ctrl.subscribe);
router.post('/unsubscribe', ctrl.unsubscribe);
router.get('/', protect, adminOnly, ctrl.getSubscribers);

module.exports = router;
