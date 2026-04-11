const express = require('express');
const router = express.Router();
const recentlyViewedController = require('../controllers/trendingController');

router.get('/:userId', recentlyViewedController.getRecentlyViewed);

module.exports = router;
