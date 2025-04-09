import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async controller function to catch any errors and pass them to the next middleware
 * This eliminates the need for try/catch blocks in each controller
 */
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(next);
  };
};

export default catchAsync; 