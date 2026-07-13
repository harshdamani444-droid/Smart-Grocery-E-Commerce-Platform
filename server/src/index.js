import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import Product from './models/Product.js';
import User from './models/User.js';
import Coupon from './models/Coupon.js';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Manually parse .env to force override system environment variables
try {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath));
    for (const k in envConfig) {
      process.env[k] = envConfig[k];
    }
  }
} catch (err) {
  console.error('Error manual parsing env:', err.message);
  dotenv.config({ path: path.resolve(__dirname, '../.env'), override: true });
}

// Database connection initiated in startServer()

const app = express();
const server = http.createServer(app);

// Setup Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

// Save socket instance globally on app
app.set('io', io);

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/upload', uploadRoutes);

// Simple status route
app.get('/api/status', (req, res) => {
  res.json({ status: 'API is running successfully!' });
});

// Socket.io connection logic
io.on('connection', (socket) => {
  console.log(`Socket client connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`Socket client disconnected: ${socket.id}`);
  });
});

// Seed data function if collections are empty
const autoSeed = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Database empty. Running auto-seeding...');

      // Seed coupon codes
      await Coupon.create([
        { code: 'DMART10', discountType: 'percentage', discountValue: 10, minPurchase: 500, expiryDate: new Date('2027-12-31') },
        { code: 'SUPER50', discountType: 'flat', discountValue: 50, minPurchase: 300, expiryDate: new Date('2027-12-31') }
      ]);

      // Seed an admin user and standard user first so we can reference them in reviews
      let customerUser = await User.findOne({ email: 'user@gmail.com' });
      if (!customerUser) {
        customerUser = await User.create({
          name: 'Harsh Vardhan',
          email: 'user@gmail.com',
          password: 'userpassword',
          role: 'customer'
        });
        console.log('Seeded Customer account: user@gmail.com / userpassword');
      }

      let adminUser = await User.findOne({ email: 'admin@gmail.com' });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'DMart Admin',
          email: 'admin@gmail.com',
          password: 'adminpassword',
          role: 'admin'
        });
        console.log('Seeded Admin account: admin@gmail.com / adminpassword');
      }

      const customerId = customerUser._id;

      // Seed custom products with barcode numbers
      await Product.create([
        {
          name: 'Fresh Organic Apples',
          description: 'Sweet, crisp, and high-quality organic Red Delicious apples sourced from local orchards. Rich in vitamins and fiber.',
          price: 180,
          category: 'Fruits & Vegetables',
          image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400',
          stock: 45,
          barcode: '8901030752538',
          unit: '1kg',
          tags: ['apple', 'fruit', 'organic', 'fresh'],
          rating: 4.5,
          numReviews: 2,
          reviews: [
            { user: customerId, name: 'Rohan Sharma', rating: 5, comment: 'Very juicy and fresh!' },
            { user: customerId, name: 'Pooja Patil', rating: 4, comment: 'Good size, organic and tasty.' }
          ],
          storeAvailability: [
            { storeName: 'DMart Powai', stock: 20, lat: 19.1176, lng: 72.9060 },
            { storeName: 'DMart Malad', stock: 15, lat: 19.1860, lng: 72.8485 },
            { storeName: 'DMart Thane', stock: 10, lat: 19.2183, lng: 72.9781 }
          ]
        },
        {
          name: 'Full Cream Milk',
          description: 'Pasteurized homogenized cow milk. Perfect for coffee, tea, and daily nutritional needs.',
          price: 66,
          category: 'Dairy & Eggs',
          image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&q=80&w=400',
          stock: 60,
          barcode: '8901262070011',
          unit: '1L',
          tags: ['milk', 'dairy', 'cream', 'fresh'],
          rating: 4.8,
          numReviews: 1,
          reviews: [
            { user: customerId, name: 'Amit Kumar', rating: 5, comment: 'Tastes pure, excellent cream quality.' }
          ],
          storeAvailability: [
            { storeName: 'DMart Powai', stock: 25, lat: 19.1176, lng: 72.9060 },
            { storeName: 'DMart Malad', stock: 20, lat: 19.1860, lng: 72.8485 },
            { storeName: 'DMart Thane', stock: 15, lat: 19.2183, lng: 72.9781 }
          ]
        },
        {
          name: 'Brown Bread',
          description: 'Whole wheat bakery bread, fresh and fiber-rich. Made with whole grains for a healthy breakfast.',
          price: 45,
          category: 'Bakery',
          image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400',
          stock: 25,
          barcode: '8901725181223',
          unit: '400g',
          tags: ['bread', 'bakery', 'brown', 'wheat', 'healthy'],
          rating: 4.2,
          numReviews: 0,
          storeAvailability: [
            { storeName: 'DMart Powai', stock: 10, lat: 19.1176, lng: 72.9060 },
            { storeName: 'DMart Malad', stock: 8, lat: 19.1860, lng: 72.8485 },
            { storeName: 'DMart Thane', stock: 7, lat: 19.2183, lng: 72.9781 }
          ]
        },
        {
          name: 'Chocolate Chip Cookies',
          description: 'Delicious oven-baked cookies loaded with rich chocolate chips. An absolute treat for children and adults.',
          price: 90,
          category: 'Packaged Food',
          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&q=80&w=400',
          stock: 40,
          barcode: '8901063142275',
          unit: '150g',
          tags: ['cookies', 'chocolate', 'biscuits', 'sweet', 'packaged'],
          rating: 4.6,
          numReviews: 2,
          reviews: [
            { user: customerId, name: 'Kunal Sen', rating: 5, comment: 'Loads of chocolate chips, love it!' },
            { user: customerId, name: 'Sara Khan', rating: 4, comment: 'Crisp and chocolaty.' }
          ],
          storeAvailability: [
            { storeName: 'DMart Powai', stock: 15, lat: 19.1176, lng: 72.9060 },
            { storeName: 'DMart Malad', stock: 15, lat: 19.1860, lng: 72.8485 },
            { storeName: 'DMart Thane', stock: 10, lat: 19.2183, lng: 72.9781 }
          ]
        },
        {
          name: 'Dishwashing Liquid Lemon',
          description: 'Anti-bacterial formula that cuts tough grease easily, leaving utensils sparkling clean and smelling of fresh lemons.',
          price: 110,
          category: 'Household Care',
          image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&q=80&w=400',
          stock: 35,
          barcode: '8901030704957',
          unit: '500ml',
          tags: ['dishwash', 'lemon', 'clean', 'household'],
          rating: 4.4,
          numReviews: 0,
          storeAvailability: [
            { storeName: 'DMart Powai', stock: 15, lat: 19.1176, lng: 72.9060 },
            { storeName: 'DMart Malad', stock: 10, lat: 19.1860, lng: 72.8485 },
            { storeName: 'DMart Thane', stock: 10, lat: 19.2183, lng: 72.9781 }
          ]
        },
        {
          name: 'Classic Potato Chips',
          description: 'Crisp and crunchy salted potato chips. The perfect companion for movie nights or tea time.',
          price: 30,
          category: 'Packaged Food',
          image: 'https://images.unsplash.com/photo-1566478989037-eec170784d20?auto=format&fit=crop&q=80&w=400',
          stock: 5, // low stock for alert testing
          barcode: '8901040200135',
          unit: '90g',
          tags: ['chips', 'potato', 'salted', 'snacks', 'packaged'],
          rating: 4.1,
          numReviews: 1,
          reviews: [
            { user: customerId, name: 'Neelam Joshi', rating: 4, comment: 'Crisp and salty.' }
          ],
          storeAvailability: [
            { storeName: 'DMart Powai', stock: 2, lat: 19.1176, lng: 72.9060 },
            { storeName: 'DMart Malad', stock: 2, lat: 19.1860, lng: 72.8485 },
            { storeName: 'DMart Thane', stock: 1, lat: 19.2183, lng: 72.9781 }
          ]
        }
      ]);
    }
  } catch (err) {
    console.error('Error auto-seeding:', err.message);
  }
};

const PORT = process.env.PORT || 5000;

// ✅ Serve React Frontend in Production
if (process.env.NODE_ENV === 'production') {
  // Serve static files from client/dist
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // All non-API routes → serve React's index.html (for React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist', 'index.html'));
  });
  console.log('Serving React frontend from client/dist');
}

const startServer = async () => {
  await connectDB();
  server.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    await autoSeed();
  });
};

startServer();
