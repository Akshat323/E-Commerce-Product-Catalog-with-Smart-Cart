const redis = require('../config/redis');

const PROFILE_TTL = 86400 * 30; // 30 days in seconds

const profileService = {
  /**
   * Save user shipping profile to Redis
   * HMSET profile:<userId> <data>
   */
  async saveProfile(userId, profileData) {
    const key = `profile:${userId}`;
    
    // Set each field individually for maximum compatibility with all Redis versions
    for (const [field, value] of Object.entries(profileData)) {
      if (value !== undefined && value !== null) {
        await redis.hset(key, field, value.toString());
      }
    }

    // Set 30 day expiration
    await redis.expire(key, PROFILE_TTL);
    return true;
  },

  /**
   * Get user shipping profile from Redis
   * HGETALL profile:<userId>
   */
  async getProfile(userId) {
    const key = `profile:${userId}`;
    const profile = await redis.hgetall(key);
    return Object.keys(profile).length > 0 ? profile : null;
  }
};

module.exports = profileService;
