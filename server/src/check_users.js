import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'smart-grocery' });
    console.log('Connected to database.');

    const users = await User.find({}, 'name email role');
    console.log('Users in DB:', JSON.stringify(users, null, 2));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
};

checkUsers();
