import { Request, Response } from 'express';
import { EventEmitter } from 'events';
import { AIResponse, RequestWithUser, QueryDocument } from '../types';
import { generateResponse } from '../services/gemini';
import config from '../config/config';

// Interface for the QueryModel
interface QueryModel {
  create(data: {
    user: any;
    query: string;
    response: string;
    metadata: any;
  }): Promise<QueryDocument>;
}

// Check if we have the correct model import name
let QueryModel: QueryModel | null = null;
try {
  QueryModel = require('../models/Query') as QueryModel;
} catch (e) {
  try {
    QueryModel = require('../models/query.model') as QueryModel;
  } catch (e) {
    console.error('Could not find Query model. Please check the correct import path.');
  }
}

// Helper function to catch async errors
const catchAsync = (fn: Function) => (req: Request, res: Response) => {
  Promise.resolve(fn(req, res)).catch((err) => {
    console.error('Controller error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'An error occurred',
    });
  });
};

/**
 * Generate an AI response using Gemini
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

  const response = await generateResponse(query) as AIResponse;

  // Save the query and response to the database if user is authenticated
  if (req.user && QueryModel) {
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
    const stream = await generateResponse(query, true) as EventEmitter;
    
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
      
      if (req.user && fullResponse && QueryModel) {
        const model = config.GEMINI_MODEL;
        await QueryModel.create({
          user: req.user._id,
          query,
          response: fullResponse,
          metadata: {
            model,
            tokens: Math.ceil(fullResponse.length / 4), // Rough estimation for Gemini
            processingTime
          },
        });
      }
      
      res.write(`data: [DONE]\n\n`);
      res.end();
    });

    stream.on('error', (error: Error) => {
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