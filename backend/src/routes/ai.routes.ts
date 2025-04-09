import express from 'express';
import { generateAIResponse, streamAIResponse } from '../controllers/ai.controller';
import { protect } from '../middleware/auth';

const router = express.Router();

router.route('/generate').post(protect, generateAIResponse);
router.route('/stream').post(protect, streamAIResponse);

export default router; 