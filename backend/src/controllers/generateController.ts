import { Response } from 'express';
import generateService from '../services/generateService';
import { RequestWithUser, AIResponse } from '../types';
import Query from '../models/Query';
import catchAsync from '../utils/catchAsync';

// @desc    Generate AI response from Gemini
// @route   POST /api/generate
// @access  Private
export const generateResponse = catchAsync(async (req: RequestWithUser, res: Response) => {
  const { query } = req.body;
  const userId = req.user?._id;

  // Type assertion to AIResponse since we're not using stream mode here
  const response = await generateService.generateAIResponse(query) as AIResponse;

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

// @desc    Stream AI response from Gemini
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
    console.log('Calling gemini service...');
    const stream = await generateService.generateStream(query);
    console.log('Got stream response:', typeof stream);
    
    let completeResponse = '';

    // Handle the stream using EventEmitter pattern
    if ('on' in stream) {
      console.log('Using EventEmitter pattern');
      
      stream.on('data', (chunk: Buffer) => {
        try {
          const chunkStr = chunk.toString();
          
          const lines = chunkStr
            .split('\n')
            .filter((line) => line.trim() !== '');
  
          for (const line of lines) {
            if (line.includes('[DONE]')) {
              return;
            }
            if (line.startsWith('data:')) {
              const jsonString = line.replace(/^data: /, '').trim();
              if (jsonString) {
                try {
                  // Parse the JSON and extract the content directly
                  const json = JSON.parse(jsonString);
                  
                  // Check if content exists directly (this is the format from our Gemini service)
                  if (json.content) {
                    completeResponse += json.content;
                    
                    // Forward exactly the same format to frontend
                    res.write(`data: ${JSON.stringify({ content: json.content })}\n\n`);
                  } 
                  // Fallback for nested structure from OpenAI format
                  else if (json.choices?.[0]?.delta?.content) {
                    const content = json.choices[0].delta.content;
                    completeResponse += content;
                    res.write(`data: ${JSON.stringify({ content })}\n\n`);
                  }
                } catch (parseError) {
                  console.error('Error parsing JSON:', parseError, 'from string:', jsonString);
                }
              }
            }
          }
        } catch (error) {
          console.error('Error processing stream chunk:', error);
        }
      });
  
      stream.on('end', async () => {
        if (userId && completeResponse) {
          const userIdStr = userId.toString();
          await generateService.saveInteraction(userIdStr, query, completeResponse);
        }

        res.write('data: [DONE]\n\n');
        res.end();
      });
  
      stream.on('error', (error: Error) => {
        console.error('Error in stream processing:', error);
        res.write(`data: ${JSON.stringify({ error: error.message || 'An error occurred' })}\n\n`);
        res.end();
      });
    } else {
      // If somehow we got an AIResponse instead of a stream
      console.log('Using direct response pattern');
      const response = stream as AIResponse;
      
      // Send the entire response at once in the expected format
      const formattedResponse = response.formattedResponse;
      res.write(`data: ${JSON.stringify({ content: formattedResponse })}\n\n`);
      
      if (userId) {
        const userIdStr = userId.toString();
        await generateService.saveInteraction(userIdStr, query, formattedResponse);
      }

      res.write('data: [DONE]\n\n');
      res.end();
    }
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