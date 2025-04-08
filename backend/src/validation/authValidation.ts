import { Request, Response, NextFunction } from 'express';
import { body, validationResult, ValidationChain } from 'express-validator';

// Registration validation rules
export const registerValidation: ValidationChain[] = [
  body('username')
    .notEmpty()
    .withMessage('Username is required')
    .trim()
    .isLength({ max: 50 })
    .withMessage('Username cannot be more than 50 characters'),
  
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please include a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Login validation rules
export const loginValidation: ValidationChain[] = [
  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please include a valid email'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

// Validation result middleware
export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      success: false, 
      errors: errors.array().map(error => ({ msg: error.msg }))
    });
    return;
  }
  next();
}; 