const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');

router.post('/', checkoutController.checkout);
router.get('/orders/:userId', checkoutController.getOrders);
router.get('/profile/:userId', checkoutController.getLatestProfile);

module.exports = router;
