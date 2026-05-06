const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/homepageSection.controller');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.get('/', ctrl.getHomepageSections);
router.get('/admin/all', protect, adminOnly, ctrl.getAllSectionsAdmin);
router.post('/', protect, adminOnly, ctrl.createSection);
router.put('/:id', protect, adminOnly, ctrl.updateSection);
router.delete('/:id', protect, adminOnly, ctrl.deleteSection);
router.patch('/reorder', protect, adminOnly, ctrl.reorderSections);
router.patch('/:id/toggle', protect, adminOnly, ctrl.toggleSection);

module.exports = router;
