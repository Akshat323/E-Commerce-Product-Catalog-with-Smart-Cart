// Quick script to convert all product prices from USD to INR
// Rate: 1 USD = 85.5 INR (approx current rate)

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');

const RATE = 85.5;

async function convertPrices() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const collection = db.collection('products');

  // Update all product prices
  const products = await collection.find({}).toArray();
  console.log(`Found ${products.length} products to convert`);

  for (const product of products) {
    const newPrice = Math.round(product.price * RATE * 100) / 100;
    const newRevenue = Math.round(product.total_revenue * RATE * 100) / 100;
    
    await collection.updateOne(
      { _id: product._id },
      { $set: { price: newPrice, total_revenue: newRevenue } }
    );
    console.log(`  ${product.name}: $${product.price} -> ₹${newPrice}`);
  }

  // Also update order amounts
  const orders = db.collection('orders');
  const orderCount = await orders.countDocuments();
  if (orderCount > 0) {
    const allOrders = await orders.find({}).toArray();
    for (const order of allOrders) {
      const newTotal = Math.round(order.total_amount * RATE * 100) / 100;
      const newItems = order.order_items.map(item => ({
        ...item,
        price: Math.round(item.price * RATE * 100) / 100
      }));
      await orders.updateOne(
        { _id: order._id },
        { $set: { total_amount: newTotal, order_items: newItems } }
      );
    }
    console.log(`Updated ${orderCount} orders`);
  }

  console.log('\nDone! All prices converted from USD to INR (rate: 85.5)');
  process.exit(0);
}

convertPrices().catch(err => {
  console.error(err);
  process.exit(1);
});
