const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true
  },
  user_id: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// After saving a review, recalculate avg_rating and review_count on the product
reviewSchema.post('save', async function () {
  const Review = this.constructor;
  const { Product } = require('./Product');

  const stats = await Review.aggregate([
    { $match: { product_id: this.product_id } },
    {
      $group: {
        _id: '$product_id',
        avg_rating: { $avg: '$rating' },
        review_count: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(this.product_id, {
      avg_rating: Math.round(stats[0].avg_rating * 10) / 10,
      review_count: stats[0].review_count
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
