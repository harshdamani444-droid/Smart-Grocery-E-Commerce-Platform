import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    let adminUser = await User.findOne({ email: 'admin@gmail.com' });
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.password = 'adminpassword';
      await adminUser.save();
      console.log('Updated existing admin@gmail.com account to role: admin and password: adminpassword');
    } else {
      await User.create({
        name: 'HD Mart Admin',
        email: 'admin@gmail.com',
        password: 'adminpassword',
        role: 'admin'
      });
      console.log('Created new admin@gmail.com account with role: admin and password: adminpassword');
    }

    process.exit(0);
  } catch (error) {
    console.error('Reset failed:', error);
    process.exit(1);
  }
};

resetAdmin();
