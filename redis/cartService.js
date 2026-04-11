const redis = require('../config/redis');

const CART_TTL = 86400; // 24 hours in seconds

const cartService = {
  /**
   * Add item to cart or update its quantity
   * HSET cart:<userId> <productId> <qty>
   */
  async addToCart(userId, productId, quantity) {
    const key = `cart:${userId}`;
    
    // Atomic increment/decrement
    const newQty = await redis.hincrby(key, productId, quantity);
    
    if (newQty <= 0) {
      await redis.hdel(key, productId);
      return { productId, quantity: 0, removed: true };
    }

    await redis.expire(key, CART_TTL);
    return { productId, quantity: newQty };
  },

  /**
   * Get all items in a user's cart
   * HGETALL cart:<userId>
   */
  async getCart(userId) {
    const key = `cart:${userId}`;
    const cart = await redis.hgetall(key);
    // Returns { productId: qty, ... }
    return cart;
  },

  /**
   * Remove an item from the cart
   * HDEL cart:<userId> <productId>
   */
  async removeFromCart(userId, productId) {
    const key = `cart:${userId}`;
    await redis.hdel(key, productId);
    return true;
  },

  /**
   * Set exact quantity for an item (remove if qty <= 0)
   * HSET cart:<userId> <productId> <qty>
   */
  async updateQuantity(userId, productId, quantity) {
    const key = `cart:${userId}`;
    if (quantity <= 0) {
      await redis.hdel(key, productId);
      return { productId, quantity: 0, removed: true };
    }
    await redis.hset(key, productId, quantity);
    await redis.expire(key, CART_TTL);
    return { productId, quantity };
  },

  /**
   * Delete entire cart (used after checkout)
   * DEL cart:<userId>
   */
  async deleteCart(userId) {
    const key = `cart:${userId}`;
    await redis.del(key);
    return true;
  },

  /**
   * Get total number of items in cart
   */
  async getCartCount(userId) {
    const key = `cart:${userId}`;
    const cart = await redis.hgetall(key);
    let count = 0;
    for (const qty of Object.values(cart)) {
      count += parseInt(qty) || 0;
    }
    return count;
  }
};

module.exports = cartService;
