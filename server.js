require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const cron = require('node-cron');

const connectDB = require('./config/db');
const trendingService = require('./redis/trendingService');

// Import routes
const productRoutes = require('./routes/productRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const trendingRoutes = require('./routes/trendingRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const recentlyViewedRoutes = require('./routes/recentlyViewedRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ──────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend files
app.use(express.static(path.join(__dirname, 'public')));

// ─── API Routes ─────────────────────────────────────────────────────
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/trending', trendingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);

// ─── Health Check ───────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// ─── SPA Fallback — serve index.html for frontend routes ────────────
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

// ─── Cron Job: Reset trending sorted set every hour ─────────────────
cron.schedule('0 * * * *', async () => {
  try {
    await trendingService.resetTrending();
  } catch (error) {
    console.error('[CRON] Error resetting trending:', error.message);
  }
});

// ─── Start Server ───────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n🚀 Server running on http://localhost:${PORT}`);
      console.log(`📦 API endpoints at http://localhost:${PORT}/api`);
      console.log(`🌐 Frontend at http://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
