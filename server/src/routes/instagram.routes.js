const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/instagram.controller');

router.get('/feed', ctrl.getInstagramFeed);

module.exports = router;
