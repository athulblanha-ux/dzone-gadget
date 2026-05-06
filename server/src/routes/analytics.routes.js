const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analytics.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/dashboard', protect, adminOnly, ctrl.getDashboardAnalytics);

module.exports = router;
