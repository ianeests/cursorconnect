import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ErrorResponse from '../utils/errorResponse';
import User from '../models/User';
import config from '../config/config';
import { RequestWithUser } from '../types';

interface JwtPayload {
  id: string;
}

// Protect routes
export const protect = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    next(new ErrorResponse('Not authorized to access this route', 401));
    return;
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, config.JWT_SECRET) as JwtPayload;

    const user = await User.findById(decoded.id);

    if (!user) {
      next(new ErrorResponse('User not found', 404));
      return;
    }

    req.user = user;

    next();
  } catch (err) {
    next(new ErrorResponse('Not authorized to access this route', 401));
  }
}; 