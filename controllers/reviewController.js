const Review = require('../models/Review');
const { Product } = require('../models/Product');

const reviewController = {
  // post a new review
  async createReview(req, res) {
    try {
      const { product_id, user_id, username, rating, comment } = req.body;

      if (!product_id || !user_id || !rating) {
        return res.status(400).json({
          success: false,
          message: 'product_id, user_id, and rating are required'
        });
      }

      // Verify product exists
      const product = await Product.findById(product_id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const review = await Review.create({
        product_id,
        user_id: user_id || 'anonymous',
        username,
        rating: parseInt(rating),
        comment: comment || ''
      });

      res.status(201).json({
        success: true,
        message: 'Review submitted successfully',
        data: review
      });
    } catch (error) {
      console.error('Error creating review:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  // get reviews for a product
  async getProductReviews(req, res) {
    try {
      const { productId } = req.params;

      const reviews = await Review.find({ product_id: productId })
        .sort({ createdAt: -1 })
        .lean();

      res.json({ success: true, data: reviews });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = reviewController;
