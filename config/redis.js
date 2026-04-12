const Redis = require('ioredis');

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) {
      console.log('[Redis] Max reconnection attempts reached. Redis features will be unavailable.');
      return null; // Stop retrying
    }
    const delay = Math.min(times * 500, 3000);
    return delay;
  },
  lazyConnect: false,
  showFriendlyErrorStack: true
});

let isConnected = false;

redis.on('connect', () => {
  isConnected = true;
  console.log('Redis Connected');
});

redis.on('error', (err) => {
  if (isConnected) {
    console.error('Redis Error:', err.message);
  }
  isConnected = false;
});

redis.on('close', () => {
  isConnected = false;
});

// Helper to check if Redis is available
redis.isAvailable = () => isConnected;

module.exports = redis;
