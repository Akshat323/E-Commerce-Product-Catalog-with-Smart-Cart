# ⚡ NovaMart — Smart Product Catalog & Cart

NovaMart is a full-stack, highly responsive e-commerce web application designed to demonstrate the power of **NoSQL databases**. It utilizes **MongoDB** for robust, polymorphic persistent data storage and **Redis** for an ultra-fast, ephemeral caching and session management layer.

## 🌟 Key Features

### 🛍️ Dynamic Product Management (MongoDB)
- **Polymorphic Product Schemas**: Supports multiple product types (Electronics, Books, Clothing) within a single collection, allowing varied sub-fields (e.g. `warranty_period` for electronics vs. `author` for books).
- **Computed Fields & Aggregation**: Uses MongoDB aggregation pipelines to calculate average ratings, total reviews, and revenue metrics dynamically.

### 🚀 Ephemeral High-Speed Features (Redis)
- **Smart Shopping Cart**: Carts are managed entirely in Redis for instantaneous add/remove interactions and auto-expiring sessions.
- **Trending Now**: Uses Redis Sorted Sets (`ZSET`) to track real-time hourly views on products and calculate "Trending" lists instantly.
- **Recently Viewed**: Uses Redis Lists (`LPUSH`/`LTRIM`) to maintain a lightning-fast record of the user's previously viewed items.
- **View Tracking**: Uses Redis HyperLogLogs (`PFADD`) to track unique product view counts.

### 🎨 Premium UI
- **Glassmorphism Design System**: Features a high-quality, modern, custom CSS design featuring mesh gradients, frosted glass drop-shadows, and dynamic micro-animations.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Glassmorphism), JavaScript
- **Backend Environment**: Node.js & Express.js
- **Primary Database**: MongoDB & Mongoose
- **Caching & Ephemeral DB**: Redis
- **Background Tasks**: Node-Cron (for resetting trending metrics hourly)

---

## 📂 Project Structure

```text
├── config/
│   ├── db.js                # MongoDB connection setup
│   └── redis.js             # Redis connection setup
├── controllers/             # Request handlers (Products, Cart, Checkout, etc.)
├── models/
│   ├── Product.js           # Mongoose polymorphic product schema
│   ├── Order.js             # Basic order schema for checkout
│   └── Review.js            # Review schema and aggregation hooks
├── public/                  # Frontend files
│   ├── css/style.css        # Glassmorphism Design CSS
│   ├── js/                  # Frontend JS (app.js, cart.js, product.js, checkout.js)
│   └── *.html               # Storefront HTML views
├── redis/                   # Redis Ephemeral logic
│   ├── cartService.js       # Redis hash map logic for cart items
│   ├── recentlyViewedService.js # Redis list logic for history
│   ├── trendingService.js   # Redis ZSET logic for trending
│   └── viewService.js       # Redis HyperLogLog for unique views
├── routes/                  # Express REST API Routes
├── server.js                # Main application entry point
└── package.json             # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community)
- [Redis](https://redis.io/download/)

### Installation & Setup

1. **Install Dependencies**
   Open your terminal in the project directory and run:
   ```bash
   npm install
   ```

2. **Database Setup**
   Ensure your local MongoDB and Redis servers are currently running.
   - Redis usually runs on `localhost:6379`
   - MongoDB usually runs on `localhost:27017`

3. **Populate Seed Data (Optional)**
   If you have a `/seed` directory with seed scripts, you can populate the database:
   ```bash
   npm run seed
   ```
   *(Or run `node seed/seed.js` depending on your setup).*

4. **Start the Application**
   Run the Node.js server:
   ```bash
   node server.js
   ```

5. **Visit the App**
   Open your browser and navigate to:
   - **Frontend UI:** [http://localhost:3000](http://localhost:3000)
   - **API Base URL:** [http://localhost:3000/api](http://localhost:3000/api)

---

## 📝 API Endpoints Summary

- **`GET /api/products`**: Fetch products (with pagination, filters, and prices in `₹`).
- **`GET /api/trending`**: Fetch real-time trending products from Redis.
- **`GET /api/recently-viewed/:userId`**: Fetch user's recent history.
- **`POST /api/cart`**: Add a product to the Redis shopping cart.
- **`POST /api/checkout`**: Convert Redis Cart items into a finalized MongoDB order.
- **`POST /api/reviews`**: Add a review to a product and trigger MongoDB recalculations.

---

> **Note:** The UI has been recently upgraded to a glassmorphic aesthetic. Prices are listed dynamically in Indian Rupees `₹`. Enjoy exploring the NoSQL capabilities seamlessly blended into a modern web project!
