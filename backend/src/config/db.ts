import mongoose from 'mongoose';
import config from './config';

/**
 * Connect to MongoDB
 * @returns {Promise} Mongoose connection promise
 */
const connectDB = async (): Promise<mongoose.Connection> => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn.connection;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
};

export default connectDB; 