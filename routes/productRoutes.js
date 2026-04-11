const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Analytics routes (must be before /:id to avoid conflict)
router.get('/analytics/best-selling', productController.bestSelling);
router.get('/analytics/monthly-revenue', productController.monthlyRevenue);
router.get('/analytics/low-rated', productController.lowRated);
router.get('/analytics/stock-summary', productController.stockSummary);

// Product CRUD
router.get('/', productController.listProducts);
router.get('/:id', productController.getProduct);

module.exports = router;
