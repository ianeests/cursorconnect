import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, ValidationChain } from 'express-validator';
import mongoose from 'mongoose';

// Query validation rules
export const queryValidation: ValidationChain[] = [
  body('query')
    .notEmpty()
    .withMessage('Query text is required')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Query must be between 1 and 2000 characters'),
];

// Query ID validation rule - more permissive to handle different ID formats
export const queryIdValidation: ValidationChain[] = [
  param('id')
    .custom((value) => {
      // First try to validate as MongoDB ObjectId
      if (mongoose.Types.ObjectId.isValid(value)) {
        return true;
      }
      
      // If not a valid ObjectId, check if it's a string with reasonable length
      if (typeof value === 'string' && value.length > 0 && value.length < 100) {
        return true;
      }
      
      throw new Error('Invalid query ID format');
    })
    .withMessage('Invalid query ID format'),
];

// Validation result middleware
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      errors: errors.array().map(error => ({ msg: error.msg })),
    });
    return;
  }
  next();
}; 