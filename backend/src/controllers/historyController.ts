import { Response } from 'express';
import historyService from '../services/historyService';
import { RequestWithUser } from '../types';
import catchAsync from '../utils/catchAsync';

// @desc    Get all queries for a user
// @route   GET /api/history
// @access  Private
export const getQueries = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const queries = await historyService.getAllQueries(req.user.id);
  
  return res.status(200).json({
    success: true,
    count: queries.length,
    data: queries
  });
});

// @desc    Get single query
// @route   GET /api/history/:id
// @access  Private
export const getQuery = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  const query = await historyService.getQueryById(req.params.id, req.user.id);
  
  return res.status(200).json({
    success: true,
    data: query
  });
});

// @desc    Delete query
// @route   DELETE /api/history/:id
// @access  Private
export const deleteQuery = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  await historyService.deleteQueryById(req.params.id, req.user.id);
  
  return res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete all queries for a user
// @route   DELETE /api/history
// @access  Private
export const deleteAllQueries = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  await historyService.deleteAllQueries(req.user.id);
  
  return res.status(200).json({
    success: true,
    data: {}
  });
});

export default {
  getQueries,
  getQuery,
  deleteQuery,
  deleteAllQueries
}; 