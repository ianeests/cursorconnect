import { Response } from 'express';
import generateService from '../services/generateService';
import { RequestWithUser } from '../types';
import Query from '../models/Query';
import catchAsync from '../utils/catchAsync';

// @desc    Generate AI response from OpenAI
// @route   POST /api/generate
// @access  Private
export const generateResponse = catchAsync(async (req: RequestWithUser, res: Response) => {
  const { query } = req.body;
  const userId = req.user?._id;

  const response = await generateService.generateAIResponse(query);

  // Save to database if user is authenticated
  if (userId) {
    await Query.create({
      user: userId,
      query,
      response: response.formattedResponse,
      metadata: response.metadata
    });
  }

  return res.status(200).json({
    success: true,
    data: response
  });
});

// @desc    Stream AI response from OpenAI
// @route   POST /api/generate/stream
// @access  Private
export const streamResponse = catchAsync(async (req: RequestWithUser, res: Response) => {
  const { query } = req.body;
  const userId = req.user?._id;
  
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');

  try {
    const stream = await generateService.generateStream(query);
    
    let completeResponse = '';

    // Handle stream differently for OpenAI v4
    for await (const chunk of stream) {
      try {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          completeResponse += content;
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      } catch (error) {
        console.error('Error processing stream chunk:', error);
      }
    }

    // After stream is complete
    if (userId && completeResponse) {
      // Convert ObjectId to string if needed
      const userIdStr = userId.toString();
      await generateService.saveInteraction(userIdStr, query, completeResponse);
    }
    
    res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
    res.end();
  } catch (error) {
    console.error('Error in stream processing:', error);
    res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'An error occurred' })}\n\n`);
    res.end();
  }
});

// @desc    Get recent AI interactions for the current user
// @route   GET /api/generate/recent
// @access  Private
export const getRecentInteractions = catchAsync(async (req: RequestWithUser, res: Response) => {
  const userId = req.user?._id;
  
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'User not authenticated'
    });
  }
  
  const recentQueries = await Query.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(10);
    
  return res.status(200).json({
    success: true,
    data: recentQueries
  });
});

export default {
  generateResponse,
  streamResponse,
  getRecentInteractions
}; 