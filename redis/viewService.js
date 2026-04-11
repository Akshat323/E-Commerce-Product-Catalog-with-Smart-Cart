const redis = require('../config/redis');

const VIEW_TTL = 86400; // 24 hours for daily tracking

const viewService = {
  /**
   * Increment view count for a product
   * INCR views:<productId>
   */
  async incrementView(productId) {
    const key = `views:${productId}`;
    const views = await redis.incr(key);
    // Set TTL only on first view (when count becomes 1)
    if (views === 1) {
      await redis.expire(key, VIEW_TTL);
    }
    return views;
  },

  /**
   * Get view count for a product
   * GET views:<productId>
   */
  async getViews(productId) {
    const key = `views:${productId}`;
    const views = await redis.get(key);
    return parseInt(views) || 0;
  },

  /**
   * Get view counts for multiple products
   */
  async getMultipleViews(productIds) {
    if (!productIds || productIds.length === 0) return {};

    const pipeline = redis.pipeline();
    productIds.forEach(id => {
      pipeline.get(`views:${id}`);
    });

    const results = await pipeline.exec();
    const viewMap = {};
    productIds.forEach((id, index) => {
      viewMap[id] = parseInt(results[index][1]) || 0;
    });

    return viewMap;
  }
};

module.exports = viewService;
