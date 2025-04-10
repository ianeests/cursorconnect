import { QueryDocument } from '../types';
import { EventEmitter } from 'events';
import * as geminiService from './gemini';
import Query from '../models/Query';

// This file is now a compatibility layer that redirects to Gemini service

/**
 * Generate AI response from prompt - redirects to Gemini
 * @param query User query
 * @returns Generated response and metadata
 */
export const generateAIResponse = async (query: string) => {
  return await geminiService.generateResponse(query);
};

/**
 * Generate streaming AI response - redirects to Gemini
 * @param query User query
 * @returns Stream instance
 */
export const generateStream = async (query: string) => {
  return await geminiService.generateResponse(query, true);
};

/**
 * Stream AI response - redirects to Gemini
 * @param queryText The user's query text
 * @param userId User ID
 * @param onChunk Callback for each chunk
 * @returns Promise<void>
 */
export const streamAIResponse = async (
  queryText: string, 
  userId: string, 
  onChunk: (chunk: string) => void
): Promise<void> => {
  const stream = await geminiService.generateResponse(queryText, true) as EventEmitter;
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
              onChunk(content);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error processing stream chunk:', error);
    }
  });
  
  stream.on('end', async () => {
    try {
      // Save to database after complete response
      await Query.create({
        user: userId,
        query: queryText,
        response: fullResponse,
        metadata: {
          model: 'gemini-2.0-flash',
          tokens: Math.ceil(fullResponse.length / 4),
          processingTime: 0
        }
      });
    } catch (error) {
      console.error('Error saving query to database:', error);
    }
  });
  
  stream.on('error', (error: Error) => {
    console.error('Stream error:', error);
  });
};

/**
 * Get recent interactions for a user
 */
export const getRecentInteractions = async (userId: string, limit: number = 5) => {
  const queries = await Query.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  return queries.map(query => ({
    id: query._id.toString(),
    query: query.query,
    response: query.response,
    metadata: query.metadata || {},
    createdAt: query.createdAt,
  }));
};

/**
 * Save user query and AI response to database
 */
export const saveInteraction = async (userId: string, query: string, response: string): Promise<QueryDocument> => {
  return await Query.create({
    user: userId,
    query,
    response,
    metadata: {
      model: 'gemini-2.0-flash',
      tokens: Math.ceil(response.length / 4),
      processingTime: 0
    }
  });
};

export default {
  generateAIResponse,
  streamAIResponse,
  getRecentInteractions,
  generateStream,
  saveInteraction
}; 