import { Request, Response } from 'express';
import QueryModel from '../models/query.model';
import { generateResponse } from '../services/openai';
import { catchAsync } from '../utils/catchAsync';
import { RequestWithUser } from '../types';

/**
 * Generate an AI response
 * @route POST /api/v1/ai/generate
 */
export const generateAIResponse = catchAsync(async (req: RequestWithUser, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a query',
    });
  }

  const response = await generateResponse(query);

  // Save the query and response to the database if user is authenticated
  if (req.user) {
    await QueryModel.create({
      user: req.user._id,
      query,
      response: response.rawResponse,
      metadata: response.metadata,
    });
  }

  return res.status(200).json({
    success: true,
    data: response,
  });
});

/**
 * Stream an AI response
 * @route POST /api/v1/ai/stream
 */
export const streamAIResponse = catchAsync(async (req: RequestWithUser, res: Response) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a query',
    });
  }

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  
  try {
    const startTime = Date.now();
    const stream = await generateResponse(query, true);
    
    let fullResponse = '';

    stream.on('data', (chunk: Buffer) => {
      try {
        const lines = chunk
          .toString()
          .split('\n')
          .filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.includes('[DONE]')) {
            return;
          }
          if (line.startsWith('data:')) {
            const jsonString = line.replace(/^data: /, '').trim();
            if (jsonString) {
              const json = JSON.parse(jsonString);
              const content = json.choices[0].delta.content;
              if (content) {
                fullResponse += content;
                res.write(`data: ${JSON.stringify({ content })}\n\n`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error processing stream chunk:', error);
      }
    });

    stream.on('end', async () => {
      const endTime = Date.now();
      const processingTime = endTime - startTime;
      
      if (req.user && fullResponse) {
        const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
        await QueryModel.create({
          user: req.user._id,
          query,
          response: fullResponse,
          metadata: {
            model,
            tokens: fullResponse.split(' ').length * 1.3, // Rough estimate
            processingTime
          },
        });
      }
      
      res.write(`data: [DONE]\n\n`);
      res.end();
    });

    stream.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'An error occurred' })}\n\n`);
      res.end();
    });
  } catch (error) {
    console.error('Error setting up stream:', error);
    return res.status(500).json({
      success: false,
      message: 'Error setting up response stream',
    });
  }
}); 