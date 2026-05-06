const express = require('express');
const router = express.Router();
const {
  getRules,
  createRule,
  updateRule,
  deleteRule,
  calculateFee
} = require('../controllers/shipping.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.post('/calculate', calculateFee);

// Admin routes
router.use(protect, adminOnly);
router.get('/', getRules);
router.post('/', createRule);
router.put('/:id', updateRule);
router.delete('/:id', deleteRule);

module.exports = router;
