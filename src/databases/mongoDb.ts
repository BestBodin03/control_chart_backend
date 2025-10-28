import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const mongoUrl = process.env.MONGO_URL as string;
const connectMongoDB = async () => {
  try {
    await mongoose.connect(mongoUrl)
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1)
  }
};

export const chooseMongoCollection = async (collectionName: string) => {
  try {
    const collection = mongoose.connection.collection(collectionName);
    console.log(`📁 Accessing collection: ${collectionName}`);
    
    return collection;

  } catch (error) {
    console.error('❌ Collection not found!', error);
    throw error; // Don't exit process, let caller handle
  }
};

export default connectMongoDB;