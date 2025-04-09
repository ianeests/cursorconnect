import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import 'colors';

// Import config
import config from './config/config';

// Import database connection
import connectDB from './config/db';

// Import routes
import authRoutes from './routes/authRoutes';
import generateRoutes from './routes/generateRoutes';
import historyRoutes from './routes/historyRoutes';

// Import error handler middleware
import { errorHandler, notFound } from './middleware/errorMiddleware';

// Initialize Express app
const app: Application = express();

// Middleware
// Configure CORS to allow requests from frontend
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://cursorconnect-client.vercel.app', 'https://cursorconnect.vercel.app']
    : 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', environment: config.NODE_ENV });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/generate', generateRoutes);
app.use('/api/history', historyRoutes);

// Base route
app.get('/', (_req: Request, res: Response) => {
  res.send('API is running...');
});

// 404 handler for any unmatched routes - must come after all valid routes
app.use(notFound);

// Error handler middleware (must be last)
app.use(errorHandler);

// Set port
const PORT: number = config.PORT;

// Define error type for unhandled rejections
interface NodeJSWithCause extends Error {
  code?: string;
  cause?: unknown;
}

// Handle uncaught exceptions
process.on('uncaughtException', (err: NodeJSWithCause) => {
  console.error(`UNCAUGHT EXCEPTION! 💥 Shutting down...`.red);
  console.error(`${err.name}: ${err.message}`);
  process.exit(1);
});

// Connect to database and start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start server
    const server = app.listen(PORT, () => {
      console.log(`Server running in ${config.NODE_ENV} mode on port ${PORT}`.yellow);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: NodeJSWithCause) => {
      console.error(`UNHANDLED REJECTION! 💥 Shutting down...`.red);
      console.error(`${err.name}: ${err.message}`);
      // Close server & exit process
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error: unknown) {
    console.error(`Error starting server: ${error instanceof Error ? error.message : String(error)}`.red);
    process.exit(1);
  }
};

startServer(); 