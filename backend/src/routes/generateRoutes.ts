import express from 'express';
import { generateResponse, getRecentInteractions } from '../controllers/generateController';
import { queryValidation, validate } from '../validation/queryValidation';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate AI response route with validation
router.post('/', queryValidation, validate, generateResponse);

// Get recent interactions
router.get('/recent', getRecentInteractions);

export default router; 