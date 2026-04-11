const redis = require('../config/redis');

const MAX_RECENT = 10;

const recentlyViewedService = {
  /**
   * Add a product to the user's recently viewed list
   * LREM (dedup) + LPUSH + LTRIM to keep last 10
   */
  async addRecentlyViewed(userId, productId) {
    const key = `recently_viewed:${userId}`;
    const pid = productId.toString();

    // Remove if already exists (dedup)
    await redis.lrem(key, 0, pid);
    // Push to front
    await redis.lpush(key, pid);
    // Trim to keep only last 10
    await redis.ltrim(key, 0, MAX_RECENT - 1);

    return true;
  },

  /**
   * Get the user's recently viewed products (last 10)
   * LRANGE recently_viewed:<userId> 0 9
   */
  async getRecentlyViewed(userId) {
    const key = `recently_viewed:${userId}`;
    const productIds = await redis.lrange(key, 0, MAX_RECENT - 1);
    return productIds;
  }
};

module.exports = recentlyViewedService;
