import express from 'express';
import { generateResponse, streamResponse, getRecentInteractions } from '../controllers/generateController';
import { queryValidation, validate } from '../validation/queryValidation';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// Protect all routes
router.use(protect);

// Generate AI response route with validation
router.post('/', queryValidation, validate, generateResponse);

// Stream AI response route with validation
router.post('/stream', queryValidation, validate, streamResponse);

// Get recent interactions
router.get('/recent', getRecentInteractions);

export default router; 