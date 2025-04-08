import { Request, Response, NextFunction } from 'express';
import 'colors';

// Interface for custom API errors
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// 404 Not Found Error
export const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new ApiError(`Not Found - ${req.originalUrl}`, 404);
  next(error);
};

// Main error handler
export const errorHandler = (err: Error | ApiError, req: Request, res: Response, next: NextFunction) => {
  console.error(`Error: ${err.message}`.red);
  console.error(err.stack?.grey);
  
  // Default status code and message
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const message = err.message || 'Server Error';

  // Send structured error response
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
};

// Function to create specific API errors
export const createError = (message: string, statusCode: number) => {
  return new ApiError(message, statusCode);
}; 