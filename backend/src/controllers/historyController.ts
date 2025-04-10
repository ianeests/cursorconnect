import { Response } from 'express';
import historyService from '../services/historyService';
import { RequestWithUser } from '../types';
import catchAsync from '../utils/catchAsync';

// @desc    Get all queries for a user with pagination
// @route   GET /api/history
// @access  Private
export const getQueries = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  // Get pagination parameters from query string
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  
  // Get paginated queries
  const result = await historyService.getAllQueries(req.user._id.toString(), page, limit);
  
  return res.status(200).json({
    success: true,
    count: result.queries.length,
    total: result.total,
    pagination: {
      page: result.page,
      limit: result.limit,
      pages: result.pages,
      hasNextPage: result.page < result.pages,
      hasPrevPage: result.page > 1
    },
    data: result.queries
  });
});

// @desc    Get single query
// @route   GET /api/history/:id
// @access  Private
export const getQuery = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      error: 'Query ID is required'
    });
  }

  const query = await historyService.getQueryById(req.params.id, req.user._id.toString());
  
  return res.status(200).json({
    success: true,
    data: query
  });
});

// @desc    Delete query
// @route   DELETE /api/history/:id
// @access  Private
export const deleteQuery = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  if (!req.params.id) {
    return res.status(400).json({
      success: false,
      error: 'Query ID is required'
    });
  }

  console.log(`Deleting query with ID: ${req.params.id} for user: ${req.user._id}`);
  
  await historyService.deleteQueryById(req.params.id, req.user._id.toString());
  
  return res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Delete all queries for a user
// @route   DELETE /api/history
// @access  Private
export const deleteAllQueries = catchAsync(async (req: RequestWithUser, res: Response) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      error: 'User not authenticated'
    });
  }

  await historyService.deleteAllQueries(req.user._id.toString());
  
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