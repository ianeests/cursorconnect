import { Request, Response, NextFunction } from 'express';
import generateService from '../services/generateService';
import { RequestWithUser } from '../types';
import { ApiError } from '../middleware/errorMiddleware';

// @desc    Generate AI response from OpenAI
// @route   POST /api/generate
// @access  Private
export const generateResponse = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const { query } = req.body;
    const result = await generateService.generateAIResponse(query, req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        id: result.id,
        query: result.query,
        response: result.response,
        metadata: result.metadata || {},
        createdAt: result.createdAt,
      }
    });
  } catch (err: unknown) {
    next(err);
  }
};

// @desc    Get recent AI interactions for the current user
// @route   GET /api/generate/recent
// @access  Private
export const getRecentInteractions = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: 'User not authenticated'
      });
      return;
    }

    const queries = await generateService.getRecentInteractions(req.user.id);
    
    res.status(200).json({
      success: true,
      count: queries.length,
      data: queries
    });
  } catch (err: unknown) {
    next(err);
  }
};

export default {
  generateResponse,
  getRecentInteractions
}; 