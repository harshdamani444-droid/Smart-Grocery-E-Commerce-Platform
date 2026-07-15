import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Coupon from './models/Coupon.js';
import User from './models/User.js';
import Product from './models/Product.js';

dotenv.config();

const updateDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Update Coupon Codes
    const couponResult = await Coupon.updateMany(
      { code: 'DMART10' },
      { $set: { code: 'HDMART10' } }
    );
    console.log(`Updated ${couponResult.modifiedCount} coupons.`);

    // 2. Update Admin user name if matches DMart Admin
    const userResult = await User.updateMany(
      { name: 'DMart Admin' },
      { $set: { name: 'HD Mart Admin' } }
    );
    console.log(`Updated ${userResult.modifiedCount} users.`);

    // 3. Update StoreAvailability names in Products
    const products = await Product.find({});
    let productUpdatedCount = 0;
    for (const prod of products) {
      let isModified = false;
      if (prod.storeAvailability && prod.storeAvailability.length > 0) {
        prod.storeAvailability.forEach(store => {
          if (store.storeName.includes('DMart')) {
            store.storeName = store.storeName.replace('DMart', 'HD Mart');
            isModified = true;
          }
        });
      }
      if (isModified) {
        await prod.save();
        productUpdatedCount++;
      }
    }
    console.log(`Updated store names in ${productUpdatedCount} products.`);

    console.log('Database migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

updateDatabase();
