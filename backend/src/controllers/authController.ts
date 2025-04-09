import { Request, Response } from 'express';
import authService from '../services/authService';
import { RequestWithUser } from '../types';
import catchAsync from '../utils/catchAsync';

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.registerUser(req.body);
  
  return res.status(201).json({
    success: true,
    token: result.token,
    user: result.user
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = catchAsync(async (req: Request, res: Response) => {
  const result = await authService.loginUser(req.body);
  
  return res.status(200).json({
    success: true,
    token: result.token,
    user: result.user
  });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized'
    });
  }
  
  const user = await authService.getUserById(req.user.id);
  
  return res.status(200).json({
    success: true,
    data: user
  });
});

export default {
  register,
  login,
  getMe
}; 