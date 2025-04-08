import connectDB from '../config/db';
import config from '../config/config';

const checkDbConnection = async (): Promise<void> => {
  console.log('Checking database connection...');
  console.log(`Attempting to connect to: ${config.MONGODB_URI}`);
  
  try {
    await connectDB();
    console.log('Database connection successful!');
    process.exit(0);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

checkDbConnection(); 