const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    index: true
  },
  order_items: {
    type: [orderItemSchema],
    required: true,
    validate: [arr => arr.length > 0, 'Order must have at least one item']
  },
  total_amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'cancelled'],
    default: 'completed'
  },
  customer_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip_code: { type: String, required: true },
  phone: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

orderSchema.index({ created_at: -1 });

module.exports = mongoose.model('Order', orderSchema);
