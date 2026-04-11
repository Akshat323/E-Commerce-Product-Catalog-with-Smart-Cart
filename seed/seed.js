require('dotenv').config();

const mongoose = require('mongoose');
const { Product, Electronics, Book, Clothing } = require('../models/Product');
const Review = require('../models/Review');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Product.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing products and reviews');

    // ─── Electronics (8 products) ──────────────────────────────────
    const electronics = [
      {
        name: 'MacBook Pro 16" M3 Max',
        price: 2499.99,
        category: 'Laptops',
        brand: 'Apple',
        stock_quantity: 25,
        description: 'Supercharged by M3 Max chip with 14-core CPU, 30-core GPU. 36GB unified memory. Stunning Liquid Retina XDR display.',
        total_sold: 142,
        avg_rating: 4.8,
        review_count: 89,
        total_revenue: 354998.58,
        warranty_months: 12,
        specs: {
          processor: 'Apple M3 Max',
          ram: '36GB Unified',
          storage: '1TB SSD',
          display: '16.2" Liquid Retina XDR',
          battery: '22 hours'
        }
      },
      {
        name: 'Samsung Galaxy S24 Ultra',
        price: 1299.99,
        category: 'Smartphones',
        brand: 'Samsung',
        stock_quantity: 60,
        description: 'Galaxy AI with Snapdragon 8 Gen 3, 200MP camera, titanium frame, and S Pen built-in.',
        total_sold: 318,
        avg_rating: 4.6,
        review_count: 205,
        total_revenue: 413396.82,
        warranty_months: 24,
        specs: {
          processor: 'Snapdragon 8 Gen 3',
          ram: '12GB',
          storage: '512GB',
          display: '6.8" Dynamic AMOLED 2X',
          battery: '5000mAh'
        }
      },
      {
        name: 'Sony WH-1000XM5 Headphones',
        price: 349.99,
        category: 'Audio',
        brand: 'Sony',
        stock_quantity: 120,
        description: 'Industry-leading noise cancellation with Auto NC Optimizer. Crystal clear hands-free calling with 4 beamforming mics.',
        total_sold: 567,
        avg_rating: 4.7,
        review_count: 423,
        total_revenue: 198444.33,
        warranty_months: 12,
        specs: {
          processor: 'Integrated V1 Processor',
          ram: '',
          storage: '',
          display: '',
          battery: '30 hours'
        }
      },
      {
        name: 'iPad Air M2',
        price: 799.99,
        category: 'Tablets',
        brand: 'Apple',
        stock_quantity: 45,
        description: 'Supercharged by M2 chip. 11-inch Liquid Retina display with P3 wide color. Works with Apple Pencil Pro.',
        total_sold: 89,
        avg_rating: 4.5,
        review_count: 62,
        total_revenue: 71199.11,
        warranty_months: 12,
        specs: {
          processor: 'Apple M2',
          ram: '8GB',
          storage: '256GB',
          display: '11" Liquid Retina',
          battery: '10 hours'
        }
      },
      {
        name: 'Dell XPS 15',
        price: 1849.99,
        category: 'Laptops',
        brand: 'Dell',
        stock_quantity: 18,
        description: 'Intel Core i9-13900H, NVIDIA GeForce RTX 4070. InfinityEdge OLED display. Precision-crafted aluminum chassis.',
        total_sold: 76,
        avg_rating: 4.3,
        review_count: 54,
        total_revenue: 140599.24,
        warranty_months: 24,
        specs: {
          processor: 'Intel Core i9-13900H',
          ram: '32GB DDR5',
          storage: '1TB SSD',
          display: '15.6" OLED 3.5K',
          battery: '13 hours'
        }
      },
      {
        name: 'AirPods Pro 2nd Gen',
        price: 249.99,
        category: 'Audio',
        brand: 'Apple',
        stock_quantity: 200,
        description: 'Adaptive Audio. Active Noise Cancellation. Personalized Spatial Audio with dynamic head tracking.',
        total_sold: 1023,
        avg_rating: 4.9,
        review_count: 756,
        total_revenue: 255739.77,
        warranty_months: 12,
        specs: {
          processor: 'Apple H2 Chip',
          ram: '',
          storage: '',
          display: '',
          battery: '6 hours (30 with case)'
        }
      },
      {
        name: 'LG C3 65" OLED TV',
        price: 1796.99,
        category: 'TVs',
        brand: 'LG',
        stock_quantity: 12,
        description: 'Self-lit OLED pixels with α9 Gen6 AI Processor 4K. Dolby Vision, Dolby Atmos, webOS 23.',
        total_sold: 34,
        avg_rating: 4.7,
        review_count: 28,
        total_revenue: 61097.66,
        warranty_months: 24,
        specs: {
          processor: 'α9 Gen6 AI Processor',
          ram: '',
          storage: '',
          display: '65" 4K OLED evo',
          battery: ''
        }
      },
      {
        name: 'Logitech MX Master 3S',
        price: 99.99,
        category: 'Accessories',
        brand: 'Logitech',
        stock_quantity: 150,
        description: 'Wireless performance mouse with quiet clicks, 8K DPI tracking, and MagSpeed scroll wheel.',
        total_sold: 412,
        avg_rating: 4.6,
        review_count: 289,
        total_revenue: 41195.88,
        warranty_months: 24,
        specs: {
          processor: '',
          ram: '',
          storage: '',
          display: '',
          battery: '70 days'
        }
      }
    ];

    // ─── Books (7 products) ────────────────────────────────────────
    const books = [
      {
        name: 'Clean Code: A Handbook of Agile Software',
        price: 42.99,
        category: 'Programming',
        brand: 'Prentice Hall',
        stock_quantity: 85,
        description: 'Robert C. Martin\'s guide to writing clean, readable, and maintainable code. A must-read for every software developer.',
        total_sold: 892,
        avg_rating: 4.7,
        review_count: 634,
        total_revenue: 38347.08,
        author: 'Robert C. Martin',
        isbn: '978-0132350884',
        pages: 464,
        publisher: 'Prentice Hall'
      },
      {
        name: 'Designing Data-Intensive Applications',
        price: 47.99,
        category: 'Programming',
        brand: "O'Reilly Media",
        stock_quantity: 55,
        description: 'The big ideas behind reliable, scalable, and maintainable systems. Covers databases, distributed systems, and data processing.',
        total_sold: 645,
        avg_rating: 4.9,
        review_count: 478,
        total_revenue: 30953.55,
        author: 'Martin Kleppmann',
        isbn: '978-1449373320',
        pages: 616,
        publisher: "O'Reilly Media"
      },
      {
        name: 'The Pragmatic Programmer',
        price: 49.99,
        category: 'Programming',
        brand: 'Addison-Wesley',
        stock_quantity: 40,
        description: 'Your journey to mastery. 20th Anniversary Edition with updated content, covering modern development practices.',
        total_sold: 723,
        avg_rating: 4.8,
        review_count: 512,
        total_revenue: 36142.77,
        author: 'David Thomas, Andrew Hunt',
        isbn: '978-0135957059',
        pages: 352,
        publisher: 'Addison-Wesley'
      },
      {
        name: 'Dune',
        price: 16.99,
        category: 'Science Fiction',
        brand: 'Ace Books',
        stock_quantity: 120,
        description: 'Frank Herbert\'s epic science fiction masterpiece — a stunning blend of adventure, ecology, and politics on the desert planet Arrakis.',
        total_sold: 1567,
        avg_rating: 4.8,
        review_count: 1203,
        total_revenue: 26623.33,
        author: 'Frank Herbert',
        isbn: '978-0441013593',
        pages: 896,
        publisher: 'Ace Books'
      },
      {
        name: 'Atomic Habits',
        price: 23.99,
        category: 'Self-Help',
        brand: 'Avery Publishing',
        stock_quantity: 200,
        description: 'Proven framework for improving every day. James Clear reveals practical strategies to form good habits and break bad ones.',
        total_sold: 2341,
        avg_rating: 4.8,
        review_count: 1856,
        total_revenue: 56160.59,
        author: 'James Clear',
        isbn: '978-0735211292',
        pages: 320,
        publisher: 'Avery'
      },
      {
        name: 'System Design Interview Vol 1',
        price: 35.99,
        category: 'Programming',
        brand: 'ByteByteGo',
        stock_quantity: 70,
        description: 'Step-by-step framework to crack system design interviews. Covers real-world architectures from top tech companies.',
        total_sold: 456,
        avg_rating: 4.5,
        review_count: 312,
        total_revenue: 16411.44,
        author: 'Alex Xu',
        isbn: '978-1736049143',
        pages: 320,
        publisher: 'ByteByteGo'
      },
      {
        name: 'The Great Gatsby',
        price: 12.99,
        category: 'Fiction',
        brand: 'Scribner',
        stock_quantity: 95,
        description: 'F. Scott Fitzgerald\'s timeless classic — a portrait of the Jazz Age in all of its decadence and excess.',
        total_sold: 890,
        avg_rating: 4.4,
        review_count: 678,
        total_revenue: 11561.10,
        author: 'F. Scott Fitzgerald',
        isbn: '978-0743273565',
        pages: 180,
        publisher: 'Scribner'
      }
    ];

    // ─── Clothing (7 products) ─────────────────────────────────────
    const clothing = [
      {
        name: 'Nike Air Max 270 React',
        price: 149.99,
        category: 'Sneakers',
        brand: 'Nike',
        stock_quantity: 75,
        description: 'Combines two of Nike\'s best technologies — Max Air and React foam — for maximum comfort and a striking look.',
        total_sold: 234,
        avg_rating: 4.5,
        review_count: 167,
        total_revenue: 35097.66,
        size: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
        color: ['Black/White', 'Royal Blue', 'Obsidian'],
        material: 'Mesh upper, React foam, Max Air unit'
      },
      {
        name: 'Levi\'s 501 Original Fit Jeans',
        price: 69.50,
        category: 'Jeans',
        brand: "Levi's",
        stock_quantity: 110,
        description: 'The original blue jean since 1873. Straight leg, button fly, sits at waist. 100% cotton denim.',
        total_sold: 1456,
        avg_rating: 4.6,
        review_count: 1089,
        total_revenue: 101172.00,
        size: ['28', '30', '32', '34', '36', '38'],
        color: ['Dark Stonewash', 'Medium Stonewash', 'Rinse'],
        material: '100% Cotton Denim'
      },
      {
        name: 'Patagonia Down Sweater Jacket',
        price: 229.00,
        category: 'Jackets',
        brand: 'Patagonia',
        stock_quantity: 30,
        description: 'Lightweight, windproof jacket insulated with 800-fill-power traceable goose down. Fair Trade Certified sewn.',
        total_sold: 89,
        avg_rating: 4.8,
        review_count: 72,
        total_revenue: 20381.00,
        size: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        color: ['Black', 'Forge Grey', 'Classic Navy'],
        material: 'Recycled polyester ripstop, 800-fill-power down'
      },
      {
        name: 'Uniqlo Ultra Light Down Vest',
        price: 59.90,
        category: 'Vests',
        brand: 'Uniqlo',
        stock_quantity: 95,
        description: 'Premium down vest that\'s incredibly lightweight and packable. Water-repellent outer shell.',
        total_sold: 567,
        avg_rating: 4.4,
        review_count: 398,
        total_revenue: 33963.30,
        size: ['XS', 'S', 'M', 'L', 'XL'],
        color: ['Black', 'Navy', 'Wine', 'Olive'],
        material: 'Nylon, 90% down fill'
      },
      {
        name: 'Ralph Lauren Oxford Shirt',
        price: 98.50,
        category: 'Shirts',
        brand: 'Ralph Lauren',
        stock_quantity: 65,
        description: 'Classic-fit cotton oxford shirt with signature embroidered pony. Button-down collar. Split back yoke.',
        total_sold: 345,
        avg_rating: 4.3,
        review_count: 234,
        total_revenue: 33982.50,
        size: ['S', 'M', 'L', 'XL', 'XXL'],
        color: ['White', 'Blue', 'Pink', 'Striped'],
        material: '100% Cotton Oxford'
      },
      {
        name: 'Adidas Ultraboost 23',
        price: 189.99,
        category: 'Sneakers',
        brand: 'Adidas',
        stock_quantity: 50,
        description: 'Responsive BOOST midsole, Primeknit+ upper, and Continental rubber outsole. Made with Parley Ocean Plastic.',
        total_sold: 198,
        avg_rating: 4.7,
        review_count: 145,
        total_revenue: 37618.02,
        size: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11', 'US 12'],
        color: ['Core Black', 'Cloud White', 'Carbon'],
        material: 'Primeknit+, BOOST midsole, Continental rubber'
      },
      {
        name: 'The North Face Thermoball Eco Hoodie',
        price: 199.00,
        category: 'Jackets',
        brand: 'The North Face',
        stock_quantity: 3,
        description: 'Synthetic insulation that mimics down, even when wet. Made with recycled materials. Slim fit with hood.',
        total_sold: 123,
        avg_rating: 2.8,
        review_count: 45,
        total_revenue: 24477.00,
        size: ['S', 'M', 'L', 'XL'],
        color: ['TNF Black', 'New Taupe Green'],
        material: 'Recycled polyester, ThermoBall Eco insulation'
      }
    ];

    // Insert all products
    const insertedElectronics = await Electronics.insertMany(electronics);
    console.log(`✅ Inserted ${insertedElectronics.length} Electronics products`);

    const insertedBooks = await Book.insertMany(books);
    console.log(`✅ Inserted ${insertedBooks.length} Book products`);

    const insertedClothing = await Clothing.insertMany(clothing);
    console.log(`✅ Inserted ${insertedClothing.length} Clothing products`);

    const total = insertedElectronics.length + insertedBooks.length + insertedClothing.length;
    console.log(`\n🎉 Total products seeded: ${total}`);

    // ─── Seed some reviews ────────────────────────────────────────
    const sampleReviews = [
      { product_id: insertedElectronics[0]._id, user_id: 'user_1', rating: 5, comment: 'Absolutely incredible machine. The M3 Max chip is a beast!' },
      { product_id: insertedElectronics[0]._id, user_id: 'user_2', rating: 5, comment: 'Best laptop I\'ve ever owned. The display is gorgeous.' },
      { product_id: insertedElectronics[1]._id, user_id: 'user_1', rating: 4, comment: 'Great phone but battery could be better.' },
      { product_id: insertedElectronics[2]._id, user_id: 'user_3', rating: 5, comment: 'Noise cancellation is unreal. Perfect for flights.' },
      { product_id: insertedBooks[0]._id, user_id: 'user_2', rating: 5, comment: 'Changed the way I write code. Essential reading.' },
      { product_id: insertedBooks[1]._id, user_id: 'user_1', rating: 5, comment: 'Deep dive into distributed systems. Incredibly well written.' },
      { product_id: insertedBooks[4]._id, user_id: 'user_3', rating: 5, comment: 'Life-changing book. Applied the 1% improvement philosophy.' },
      { product_id: insertedClothing[0]._id, user_id: 'user_2', rating: 4, comment: 'Very comfortable. Runs a bit large so size down.' },
      { product_id: insertedClothing[2]._id, user_id: 'user_1', rating: 5, comment: 'Perfect warmth-to-weight ratio. Love Patagonia quality.' },
      { product_id: insertedClothing[6]._id, user_id: 'user_1', rating: 2, comment: 'Lost its insulation after a few washes. Disappointing.' },
      { product_id: insertedClothing[6]._id, user_id: 'user_3', rating: 3, comment: 'Okay for the price but North Face has done better.' },
    ];

    // Insert reviews one by one so post-save hooks fire
    for (const review of sampleReviews) {
      await Review.create(review);
    }
    console.log(`✅ Inserted ${sampleReviews.length} sample reviews`);

    console.log('\n✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seedData();
