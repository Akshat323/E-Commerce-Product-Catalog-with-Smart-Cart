const mongoose = require('mongoose');

// ─── Base Product Schema (Polymorphic Pattern) ─────────────────────
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  stock_quantity: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  image_url: {
    type: String,
    default: ''
  },

  // ─── Computed Pattern Fields ───────────────────────────────────────
  total_sold: {
    type: Number,
    default: 0
  },
  avg_rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  review_count: {
    type: Number,
    default: 0
  },
  total_revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  discriminatorKey: 'type'
});

// Indexes for filtering & sorting
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ avg_rating: -1 });
productSchema.index({ type: 1, category: 1 });
productSchema.index({ total_sold: -1 });

const Product = mongoose.model('Product', productSchema);


// ─── Electronics Discriminator ───────────────────────────────────────
const electronicsSchema = new mongoose.Schema({
  warranty_months: {
    type: Number,
    default: 12
  },
  specs: {
    processor: { type: String, default: '' },
    ram: { type: String, default: '' },
    storage: { type: String, default: '' },
    display: { type: String, default: '' },
    battery: { type: String, default: '' }
  }
});

const Electronics = Product.discriminator('Electronics', electronicsSchema);


// ─── Book Discriminator ──────────────────────────────────────────────
const bookSchema = new mongoose.Schema({
  author: {
    type: String,
    required: true
  },
  isbn: {
    type: String,
    required: true
  },
  pages: {
    type: Number,
    default: 0
  },
  publisher: {
    type: String,
    default: ''
  }
});

const Book = Product.discriminator('Book', bookSchema);


// ─── Clothing Discriminator ─────────────────────────────────────────
const clothingSchema = new mongoose.Schema({
  size: {
    type: [String],
    default: []
  },
  color: {
    type: [String],
    default: []
  },
  material: {
    type: String,
    default: ''
  }
});

const Clothing = Product.discriminator('Clothing', clothingSchema);


module.exports = { Product, Electronics, Book, Clothing };
