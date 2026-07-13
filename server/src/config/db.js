import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    console.log('Connecting to DB URI:', process.env.MONGODB_URI || 'UNDEFINED');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'smart-grocery'
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
