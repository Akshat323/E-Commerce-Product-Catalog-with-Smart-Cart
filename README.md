# Martify E-commerce Project

This is my NoSQL database project for a product catalog and shopping cart. It uses Node.js, Express, MongoDB and Redis. 
The goal was to learn how to combine a persistent database (MongoDB) with an in-memory database (Redis) for better performance.

## Features I implemented

### MongoDB for main data
- **Multiple Product Types**: Storing different kinds of products (electronics, books, clothing) in one collection using mongoose.
- **Analytics**: Used aggregation pipelines to calculate average ratings and total sales.

### Redis for caching
- **Shopping Cart**: Storing cart sessions in Redis so they are fast and can expire automatically.
- **Trending Products**: Using Redis sorted sets to show the most viewed items.
- **Recent Views**: Using Redis lists to save what the user just looked at.
- **View Count**: Tracking unique views with HyperLogLog.

## Tech Stack
- Frontend: React + Vite + basic CSS
- Backend: Node.js, Express
- Databases: MongoDB, Redis

## How to run it

### 1. Prerequisites
- **Node.js** installed on your system.
- **MongoDB** running locally on port `27017`.
- **Redis** running locally on port `6379`.

### 2. Environment Setup
Create a `.env` file in the main folder with:
```env
MONGO_URI=mongodb://localhost:27017/ecommerce_catalog
REDIS_URL=redis://localhost:6379
PORT=3000
```

### 3. Running the App
Open your terminal in the main folder and run these exact commands:

1. **Install backend dependencies:**
   ```bash
   npm install
   ```
2. **Seed the database (adds fake products to MongoDB):**
   ```bash
   npm run seed
   ```
3. **Start the backend server:**
   ```bash
   npm run start
   ```
4. Finally, open your web browser and go to `http://localhost:3000`.

### Note for editing the frontend
If you want to edit the React code, you also need to open a second terminal in the `client` folder, run `npm install`, and then launch the dev server with `npm run dev`. If you only want to view the final app, just sticking to the main folder commands is enough!

## API Endpoints List

- `GET /api/products` - Get all products, can use filters
- `GET /api/trending` - Get trending items from Redis
- `GET /api/recently-viewed/:userId` - Get user's view history
- `POST /api/cart` - Add item to cart
- `POST /api/checkout` - Create an order in mongo
- `POST /api/reviews` - Add a review
