const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/setting.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/public', ctrl.getPublicSettings);
router.get('/', protect, adminOnly, ctrl.getAllSettings);
router.get('/group/:group', protect, adminOnly, ctrl.getSettingsByGroup);
router.post('/', protect, adminOnly, ctrl.upsertSetting);
router.put('/upsert', protect, adminOnly, ctrl.upsertSetting);
router.put('/bulk', protect, adminOnly, ctrl.bulkUpsertSettings);

module.exports = router;
