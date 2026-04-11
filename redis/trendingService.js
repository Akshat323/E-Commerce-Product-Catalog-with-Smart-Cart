const redis = require('../config/redis');

const TRENDING_KEY = 'trending';

const trendingService = {
  /**
   * Track a product view in the trending sorted set
   * ZINCRBY trending 1 <productId>
   */
  async trackView(productId) {
    const score = await redis.zincrby(TRENDING_KEY, 1, productId.toString());
    return parseFloat(score);
  },

  /**
   * Get top N trending products
   * ZREVRANGE trending 0 N-1 WITHSCORES
   */
  async getTopTrending(count = 10) {
    const results = await redis.zrevrange(TRENDING_KEY, 0, count - 1, 'WITHSCORES');

    // Results come as [member1, score1, member2, score2, ...]
    const trending = [];
    for (let i = 0; i < results.length; i += 2) {
      trending.push({
        productId: results[i],
        views: parseInt(results[i + 1])
      });
    }
    return trending;
  },

  /**
   * Reset the trending sorted set (called hourly by cron)
   * DEL trending
   */
  async resetTrending() {
    await redis.del(TRENDING_KEY);
    console.log('[CRON] Trending sorted set reset');
    return true;
  }
};

module.exports = trendingService;
