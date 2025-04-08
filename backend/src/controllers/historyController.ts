import { Response, NextFunction } from 'express';
import historyService from '../services/historyService';
import { RequestWithUser } from '../types';

// @desc    Get all queries for a user
// @route   GET /api/history
// @access  Private
export const getQueries = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const queries = await historyService.getAllQueries(req.user.id);
    
    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries
    });
  } catch (err: unknown) {
    next(err);
  }
};

// @desc    Get single query
// @route   GET /api/history/:id
// @access  Private
export const getQuery = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const query = await historyService.getQueryById(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      data: query
    });
  } catch (err: unknown) {
    next(err);
  }
};

// @desc    Delete query
// @route   DELETE /api/history/:id
// @access  Private
export const deleteQuery = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    await historyService.deleteQueryById(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err: unknown) {
    next(err);
  }
};

// @desc    Delete all queries for a user
// @route   DELETE /api/history
// @access  Private
export const deleteAllQueries = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    await historyService.deleteAllQueries(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err: unknown) {
    next(err);
  }
};

export default {
  getQueries,
  getQuery,
  deleteQuery,
  deleteAllQueries
}; 