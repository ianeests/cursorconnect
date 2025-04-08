import { Request, Response, NextFunction } from 'express';
import { body, param, validationResult, ValidationChain } from 'express-validator';

// Query validation rules
export const queryValidation: ValidationChain[] = [
  body('query')
    .notEmpty()
    .withMessage('Query text is required')
    .trim()
    .isLength({ min: 1, max: 2000 })
    .withMessage('Query must be between 1 and 2000 characters'),
];

// Query ID validation rule
export const queryIdValidation: ValidationChain[] = [
  param('id')
    .isMongoId()
    .withMessage('Invalid query ID'),
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