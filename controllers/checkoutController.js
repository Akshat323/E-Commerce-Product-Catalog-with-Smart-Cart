const cartService = require('../redis/cartService');
const profileService = require('../redis/profileService');
const { Product } = require('../models/Product');
const Order = require('../models/Order');

const checkoutController = {
  /**
   * POST /checkout
   * Full checkout flow:
   * 1. Read cart from Redis
   * 2. Validate stock in MongoDB
   * 3. Create order document
   * 4. $inc stock and computed fields
   * 5. Delete Redis cart key
   */
  async checkout(req, res) {
    try {
      const { 
        userId, 
        customer_name, 
        email, 
        address, 
        city, 
        state,
        zip_code, 
        phone 
      } = req.body;

      if (!userId || !customer_name || !email || !address || !city || !state || !zip_code || !phone) {
        return res.status(400).json({
          success: false,
          message: 'All customer details (name, email, address, city, state, zip, phone) are required.'
        });
      }

      // Step 1: Read cart from Redis
      const cart = await cartService.getCart(userId);

      if (!cart || Object.keys(cart).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // Step 2: Fetch products and validate stock
      const productIds = Object.keys(cart);
      const products = await Product.find({ _id: { $in: productIds } });

      const outOfStock = [];
      const orderItems = [];
      let totalAmount = 0;

      for (const product of products) {
        const qty = parseInt(cart[product._id.toString()]);

        if (product.stock_quantity < qty) {
          outOfStock.push({
            product_id: product._id,
            name: product.name,
            requested: qty,
            available: product.stock_quantity
          });
        } else {
          orderItems.push({
            product_id: product._id,
            name: product.name,
            price: product.price,
            quantity: qty
          });
          totalAmount += product.price * qty;
        }
      }

      // If any items out of stock, return error
      if (outOfStock.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Some items are out of stock',
          outOfStock
        });
      }

      // Step 3: Create order document with embedded snapshots
      const order = await Order.create({
        user_id: userId,
        order_items: orderItems,
        total_amount: Math.round(totalAmount * 100) / 100,
        status: 'completed',
        customer_name,
        email,
        address,
        city,
        state,
        zip_code,
        phone
      });

      // Step 4: Update stock and computed fields using $inc
      const updatePromises = orderItems.map(item =>
        Product.findByIdAndUpdate(item.product_id, {
          $inc: {
            stock_quantity: -item.quantity,
            total_sold: item.quantity,
            total_revenue: item.price * item.quantity
          }
        })
      );
      await Promise.all(updatePromises);

      // Step 5: Delete Redis cart and save profile for autofill
      await Promise.all([
        cartService.deleteCart(userId),
        profileService.saveProfile(userId, {
          customer_name,
          email,
          address,
          city,
          state,
          zip_code,
          phone
        })
      ]);

      res.json({
        success: true,
        message: 'Order placed successfully!',
        data: {
          order_id: order._id,
          total_amount: order.total_amount,
          items_count: order.order_items.length,
          order_items: order.order_items,
          status: order.status,
          created_at: order.createdAt
        }
      });
    } catch (error) {
      console.error('Error during checkout:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /orders/:userId
   * Get order history for a user
   */
  async getOrders(req, res) {
    try {
      const { userId } = req.params;

      const orders = await Order.find({ user_id: userId })
        .sort({ createdAt: -1 })
        .lean();

      res.json({ success: true, data: orders });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  },

  /**
   * GET /api/checkout/profile/:userId
   * Get the saved shipping profile from Redis
   */
  async getLatestProfile(req, res) {
    try {
      const { userId } = req.params;
      const profile = await profileService.getProfile(userId);
      res.json({ success: true, data: profile });
    } catch (error) {
      console.error('Error fetching profile:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

module.exports = checkoutController;
