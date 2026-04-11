const { Product, Electronics, Book, Clothing } = require('../models/Product');
const Order = require('../models/Order');
const viewService = require('../redis/viewService');
const trendingService = require('../redis/trendingService');
const recentlyViewedService = require('../redis/recentlyViewedService');

const productController = {
  /**
   * GET /products
   * List products with filters: type, minPrice, maxPrice, minRating, category, brand
   * Supports pagination: page, limit
   * Increments view counter and updates recently viewed if userId provided
   */
  async listProducts(req, res) {
    try {
      const {
        type, minPrice, maxPrice, minRating,
        category, brand, search,
        page = 1, limit = 12,
        sort = '-createdAt',
        userId
      } = req.query;

      const filter = {};

      if (type) filter.type = type;
      if (category) filter.category = { $regex: category, $options: 'i' };
      if (brand) filter.brand = { $regex: brand, $options: 'i' };
      if (search) filter.name = { $regex: search, $options: 'i' };

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      if (minRating) {
        const r = parseFloat(minRating);
        filter.avg_rating = { $gte: r, $lt: r + 1 };
      }


      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [products, total] = await Promise.all([
        Product.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Product.countDocuments(filter)
      ]);

      // Get view counts for all products
      const productIds = products.map(p => p._id.toString());
      const viewCounts = await viewService.getMultipleViews(productIds);

      // Attach view counts
      const enrichedProducts = products.map(p => ({
        ...p,
        daily_views: viewCounts[p._id.toString()] || 0
      }));

      res.json({
        success: true,
        data: enrichedProducts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error listing products:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /products/:id
   * Product detail — triggers view counter + recently viewed
   */
  async getProduct(req, res) {
    try {
      const { id } = req.params;
      const { userId } = req.query;

      const product = await Product.findById(id).lean();
      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      // Increment view counter and update trending
      const [views] = await Promise.all([
        viewService.incrementView(id),
        trendingService.trackView(id)
      ]);

      // Update recently viewed if userId provided
      if (userId) {
        await recentlyViewedService.addRecentlyViewed(userId, id);
      }

      res.json({
        success: true,
        data: {
          ...product,
          daily_views: views
        }
      });
    } catch (error) {
      console.error('Error getting product:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /products/analytics/best-selling
   * Best-selling products per category
   */
  async bestSelling(req, res) {
    try {
      const results = await Product.aggregate([
        {
          $sort: { total_sold: -1 }
        },
        {
          $group: {
            _id: '$category',
            top_products: {
              $push: {
                id: '$_id',
                name: '$name',
                type: '$type',
                price: '$price',
                brand: '$brand',
                total_sold: '$total_sold',
                total_revenue: '$total_revenue',
                avg_rating: '$avg_rating'
              }
            }
          }
        },
        {
          $project: {
            category: '$_id',
            top_products: { $slice: ['$top_products', 5] },
            _id: 0
          }
        },
        { $sort: { category: 1 } }
      ]);

      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching best-selling:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /products/analytics/monthly-revenue
   * Monthly revenue report from orders
   */
  async monthlyRevenue(req, res) {
    try {
      const results = await Order.aggregate([
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total_revenue: { $sum: '$total_amount' },
            total_orders: { $sum: 1 },
            avg_order_value: { $avg: '$total_amount' }
          }
        },
        {
          $sort: { '_id.year': -1, '_id.month': -1 }
        },
        {
          $project: {
            _id: 0,
            year: '$_id.year',
            month: '$_id.month',
            total_revenue: { $round: ['$total_revenue', 2] },
            total_orders: 1,
            avg_order_value: { $round: ['$avg_order_value', 2] }
          }
        }
      ]);

      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching monthly revenue:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /products/analytics/low-rated
   * Products with avg_rating < 3
   */
  async lowRated(req, res) {
    try {
      const results = await Product.aggregate([
        {
          $match: {
            avg_rating: { $lt: 3 },
            review_count: { $gt: 0 }
          }
        },
        {
          $project: {
            name: 1,
            type: 1,
            category: 1,
            brand: 1,
            price: 1,
            avg_rating: 1,
            review_count: 1,
            stock_quantity: 1
          }
        },
        { $sort: { avg_rating: 1 } }
      ]);

      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching low-rated:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /products/analytics/stock-summary
   * Stock summary grouped by category and type
   */
  async stockSummary(req, res) {
    try {
      const results = await Product.aggregate([
        {
          $group: {
            _id: { category: '$category', type: '$type' },
            total_products: { $sum: 1 },
            total_stock: { $sum: '$stock_quantity' },
            avg_price: { $avg: '$price' },
            out_of_stock: {
              $sum: { $cond: [{ $eq: ['$stock_quantity', 0] }, 1, 0] }
            },
            low_stock: {
              $sum: { $cond: [{ $lte: ['$stock_quantity', 5] }, 1, 0] }
            }
          }
        },
        {
          $project: {
            _id: 0,
            category: '$_id.category',
            type: '$_id.type',
            total_products: 1,
            total_stock: 1,
            avg_price: { $round: ['$avg_price', 2] },
            out_of_stock: 1,
            low_stock: 1
          }
        },
        { $sort: { category: 1, type: 1 } }
      ]);

      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Error fetching stock summary:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = productController;
