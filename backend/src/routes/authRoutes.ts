import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { registerValidation, loginValidation, validate } from '../validation/authValidation';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Register route with validation
router.post('/register', registerValidation, validate, register);

// Login route with validation
router.post('/login', loginValidation, validate, login);

// Get current user route (protected)
router.get('/me', protect, getMe);

export default router; 