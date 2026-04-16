const cartService = require('../redis/cartService');
const profileService = require('../redis/profileService');
const { Product } = require('../models/Product');
const Order = require('../models/Order');

const checkoutController = {
  // handle user checkout (create order and clear cart)
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

      // step 1: get cart data
      const cart = await cartService.getCart(userId);

      if (!cart || Object.keys(cart).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty'
        });
      }

      // step 2: get products to check stock
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

      // step 3: create the order in db
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

      // step 4: update sales and stock count
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

      // step 5: empty cart and save profile
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

  // get user's past orders
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

  // grab saved shipping details
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
