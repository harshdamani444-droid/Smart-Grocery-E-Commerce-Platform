import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const checkOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'smart-grocery' });
    console.log('Connected to database.');

    const count = await Order.countDocuments();
    console.log(`Total orders in DB: ${count}`);

    const orders = await Order.find({}).populate('user', 'name email');
    console.log('Orders:', JSON.stringify(orders, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkOrders();
