const trendingService = require('../redis/trendingService');
const recentlyViewedService = require('../redis/recentlyViewedService');
const { Product } = require('../models/Product');

const trendingController = {
  /**
   * GET /trending
   * Return Top 10 from Redis Sorted Set with product details
   */
  async getTrending(req, res) {
    try {
      const trending = await trendingService.getTopTrending(10);

      if (trending.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Fetch product details from MongoDB
      const productIds = trending.map(t => t.productId);
      const products = await Product.find({
        _id: { $in: productIds }
      }).lean();

      // Create a map for quick lookup
      const productMap = {};
      products.forEach(p => {
        productMap[p._id.toString()] = p;
      });

      // Merge trending data with product details, maintain sort order
      const enriched = trending
        .filter(t => productMap[t.productId])
        .map(t => ({
          ...productMap[t.productId],
          trending_views: t.views
        }));

      res.json({ success: true, data: enriched });
    } catch (error) {
      console.error('Error fetching trending:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /recently-viewed/:userId
   * Return last 10 viewed products from Redis List
   */
  async getRecentlyViewed(req, res) {
    try {
      const { userId } = req.params;

      const productIds = await recentlyViewedService.getRecentlyViewed(userId);

      if (productIds.length === 0) {
        return res.json({ success: true, data: [] });
      }

      // Fetch product details from MongoDB
      const products = await Product.find({
        _id: { $in: productIds }
      }).lean();

      // Create a map and maintain order from Redis list
      const productMap = {};
      products.forEach(p => {
        productMap[p._id.toString()] = p;
      });

      const ordered = productIds
        .filter(id => productMap[id])
        .map(id => productMap[id]);

      res.json({ success: true, data: ordered });
    } catch (error) {
      console.error('Error fetching recently viewed:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = trendingController;
