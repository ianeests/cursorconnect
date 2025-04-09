import axios, { AxiosResponse } from 'axios';
import Query from '../models/Query';
import ErrorResponse from '../utils/errorResponse';
import config from '../config/config';
import { AIResponse, QueryDocument, QueryMetadata } from '../types';
import OpenAI from 'openai';
import { randomUUID } from 'crypto';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    message?: {
      role: string;
      content: string;
    };
    text?: string;
    index: number;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Generate AI response from prompt
 * @param query User query
 * @returns Generated response and metadata
 */
export const generateAIResponse = async (query: string) => {
  try {
    const startTime = Date.now();
    
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const response = completion.choices[0].message.content || '';
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    return {
      id: randomUUID(),
      formattedResponse: response,
      metadata: {
        model,
        tokens: {
          prompt: completion.usage?.prompt_tokens || 0,
          completion: completion.usage?.completion_tokens || 0,
          total: completion.usage?.total_tokens || 0
        },
        processingTime
      }
    };
  } catch (error: any) {
    console.error('Error generating AI response:', error);
    if (error.response) {
      console.error('OpenAI API error details:', error.response.data);
    }
    throw new Error(error.message || 'Failed to generate AI response');
  }
};

/**
 * Generate streaming AI response
 * @param query User query
 * @returns Stream instance for consumption with for-await-of
 */
export const generateStream = async (query: string) => {
  try {
    const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
    
    return await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: query }
      ],
      temperature: 0.7,
      max_tokens: 1000,
      stream: true,
    });
  } catch (error: any) {
    console.error('Error generating AI stream:', error);
    if (error.response) {
      console.error('OpenAI API error details:', error.response.data);
    }
    throw new Error(error.message || 'Failed to generate AI stream');
  }
};

/**
 * Stream AI response from OpenAI
 * @param {string} queryText - The user's query text
 * @param {string} userId - User ID
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<void>}
 */
export const streamAIResponse = async (
  queryText: string, 
  userId: string, 
  onChunk: (chunk: string) => void
): Promise<void> => {
  let fullResponse = '';
  let metadata: QueryMetadata = {
    model: config.OPENAI_MODEL,
    tokens: 0,
    processingTime: 0,
    startTime: Date.now(),
  };

  try {
    if (!config.OPENAI_API_KEY) {
      // Use mock for development
      await mockStreamResponse(queryText, onChunk);
      return;
    }

    // Start the timer
    const startTime = Date.now();

    // For a real implementation, we would use OpenAI's streaming API
    // This is a simplified implementation using our existing method
    await simulateStreamingResponse(queryText, onChunk);

    // Calculate processing time
    const endTime = Date.now();
    metadata.processingTime = (endTime - startTime) / 1000;

    // Save to database after complete response
    await Query.create({
      user: userId,
      query: queryText,
      response: fullResponse,
      metadata
    });
  } catch (error) {
    console.error('Error streaming response:', error);
    throw error;
  }

  // Helper function to simulate streaming with our existing API
  async function simulateStreamingResponse(query: string, callback: (chunk: string) => void): Promise<void> {
    try {
      const response = await callOpenAI(query);
      fullResponse = response.rawResponse;
      metadata = response.metadata;
      
      // Split the response into chunks and stream them
      const text = response.formattedResponse;
      const chunks = simulateChunkedText(text);
      
      for (const chunk of chunks) {
        callback(chunk);
        // Add a small delay between chunks to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error('Error in simulateStreamingResponse:', error);
      throw error;
    }
  }
};

/**
 * Helper function to break text into chunks for simulated streaming
 */
function simulateChunkedText(text: string): string[] {
  // Break the text roughly into sentences or chunks of ~10 chars
  const chunks: string[] = [];
  let currentChunk = '';
  
  for (let i = 0; i < text.length; i++) {
    currentChunk += text[i];
    
    // Break on sentence boundaries or every ~10 chars
    if (
      text[i] === '.' || 
      text[i] === '?' || 
      text[i] === '!' || 
      text[i] === '\n' ||
      currentChunk.length >= 10
    ) {
      chunks.push(currentChunk);
      currentChunk = '';
    }
  }
  
  // Add any remaining text
  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }
  
  return chunks;
}

/**
 * Get recent interactions for a user
 * @param {string} userId - User ID
 * @param {number} limit - Number of interactions to retrieve
 * @returns {Promise<Array<object>>} Recent interactions
 */
export const getRecentInteractions = async (userId: string, limit: number = 5): Promise<Array<{
  id: string;
  query: string;
  response: string;
  metadata: QueryMetadata;
  createdAt: Date;
}>> => {
  const queries = await Query.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit);

  // Format response for each query
  return queries.map(query => ({
    id: query._id.toString(),
    query: query.query,
    response: formatResponseForClient(query.response),
    metadata: query.metadata || {},
    createdAt: query.createdAt,
  }));
};

/**
 * Call OpenAI API
 * @param {string} query - User query
 * @returns {Promise<AIResponse>} AI response with raw and formatted versions
 */
async function callOpenAI(query: string): Promise<AIResponse> {
  try {
    if (!config.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found. Using mock implementation.');
      return getMockResponse(query);
    }

    // Make API request to OpenAI
    const response: AxiosResponse<OpenAIResponse> = await axios.post(
      config.OPENAI_API_ENDPOINT,
      {
        model: config.OPENAI_MODEL,
        messages: [
          {
            "role": "system",
            "content": "You are a senior software engineer and helpful AI assistant. You answer all coding-related questions using clean, efficient, and well-documented code. Always format code inside proper Markdown code blocks (e.g., triple backticks with the language specified). Use comments in code where helpful. When necessary, explain the code briefly but clearly, and offer best practices or alternative approaches if relevant. Keep answers concise and well-structured for readability. For non-coding questions, respond normally with helpful and accurate information."
          },          
          {
            role: 'user',
            content: query
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract and process the response
    const rawResponse = JSON.stringify(response.data);
    
    // Format the response for the client
    const formattedResponse = extractOpenAIResponse(response.data);
    
    // Extract useful metadata
    const metadata = {
      model: response.data.model || config.OPENAI_MODEL,
      tokens: response.data.usage?.total_tokens || 0,
      promptTokens: response.data.usage?.prompt_tokens || 0,
      completionTokens: response.data.usage?.completion_tokens || 0,
      processingTime: response.headers['openai-processing-ms'] ? 
        parseInt(response.headers['openai-processing-ms'] as string) / 1000 : 0
    };

    return {
      rawResponse,
      formattedResponse,
      metadata
    };
  } catch (error) {
    console.error('OpenAI API Error:', error instanceof Error ? error.message : String(error));
    
    if (axios.isAxiosError(error) && error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('API Response:', error.response.data);
      console.error('Status:', error.response.status);
      
      throw new ErrorResponse(
        `AI service error: ${error.response.data.error?.message || error.message}`, 
        error.response.status
      );
    } else if (axios.isAxiosError(error) && error.request) {
      // The request was made but no response was received
      throw new ErrorResponse('No response from AI service. Please try again later.', 503);
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new ErrorResponse(
        'Error generating AI response: ' + (error instanceof Error ? error.message : String(error)), 
        500
      );
    }
  }
}

/**
 * Extract text from OpenAI response
 * @param {OpenAIResponse} responseData - OpenAI API response data
 * @returns {string} Extracted text content
 */
function extractOpenAIResponse(responseData: OpenAIResponse): string {
  if (responseData.choices && responseData.choices.length > 0) {
    // For chat completions
    if (responseData.choices[0].message) {
      return responseData.choices[0].message.content.trim();
    }
    // For completions
    if (responseData.choices[0].text) {
      return responseData.choices[0].text.trim();
    }
  }
  
  // Fallback to stringifying the response
  return JSON.stringify(responseData);
}

/**
 * Format raw API response for client display
 * @param {string} rawResponse - Raw response from API (stringified JSON)
 * @returns {string} Formatted response
 */
function formatResponseForClient(rawResponse: string): string {
  try {
    // Parse the raw response if it's a string
    const parsed = typeof rawResponse === 'string' ? JSON.parse(rawResponse) : rawResponse;
    
    // For OpenAI responses
    if (parsed.choices && parsed.choices.length > 0) {
      if (parsed.choices[0].message) {
        return parsed.choices[0].message.content.trim();
      }
      if (parsed.choices[0].text) {
        return parsed.choices[0].text.trim();
      }
    }
    
    // Generic fallbacks
    if (parsed.text) {
      return parsed.text.trim();
    } else if (parsed.content) {
      return parsed.content.trim();
    } else if (typeof parsed === 'string') {
      return parsed.trim();
    }
    
    // Last resort: just stringify the object
    return JSON.stringify(parsed);
  } catch (error) {
    console.error('Error formatting response:', error instanceof Error ? error.message : String(error));
    // If there's an error parsing or formatting, return the raw response
    return typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse);
  }
}

/**
 * Generate a mock response for testing when API key is not available
 * @param {string} query - User query
 * @returns {Promise<AIResponse>} Mock response object
 */
function getMockResponse(query: string): Promise<AIResponse> {
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      // Create a mock response format similar to what the OpenAI API would return
      const mockData: OpenAIResponse = {
        id: `mock-${Date.now()}`,
        object: 'chat.completion',
        created: Math.floor(Date.now() / 1000),
        model: 'gpt-3.5-turbo-mock',
        choices: [
          {
            message: {
              role: 'assistant',
              content: `This is a mock response for: "${query}"\n\nOpenAI would provide a real response here. Please set up your API key in the .env file to get actual responses.`
            },
            finish_reason: 'stop',
            index: 0
          }
        ],
        usage: {
          prompt_tokens: query.length,
          completion_tokens: 150,
          total_tokens: query.length + 150
        }
      };

      const rawResponse = JSON.stringify(mockData);
      
      resolve({
        rawResponse,
        formattedResponse: mockData.choices[0].message!.content,
        metadata: {
          model: mockData.model,
          tokens: mockData.usage.total_tokens,
          promptTokens: mockData.usage.prompt_tokens,
          completionTokens: mockData.usage.completion_tokens,
          processingTime: 0.5,
          isMock: true
        }
      });
    }, 500);
  });
}

/**
 * Simulate a streaming response for mock implementation
 * @param {string} query - User query 
 * @param {Function} onChunk - Callback for each chunk
 * @returns {Promise<void>}
 */
async function mockStreamResponse(query: string, onChunk: (chunk: string) => void): Promise<void> {
  const mockResponse = `This is a mock streaming response for: "${query}"\n\nOpenAI would provide a real streaming response here. Please set up your API key in the .env file to get actual responses.`;
  
  // Split into chunks
  const chunks = simulateChunkedText(mockResponse);
  
  // Send each chunk with a delay
  for (const chunk of chunks) {
    onChunk(chunk);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

/**
 * Save user query and AI response to database
 * @param {string} userId - User ID
 * @param {string} query - User's query text
 * @param {string} response - AI generated response
 * @returns {Promise<QueryDocument>} Saved query document
 */
export const saveInteraction = async (userId: string, query: string, response: string): Promise<QueryDocument> => {
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';
  
  // Create a rough estimate of tokens based on whitespace-delimited words
  // This is just an approximation since we don't have token info from streaming
  const estimatedTokens = response.split(/\s+/).length * 1.3;
  
  return await Query.create({
    user: userId,
    query,
    response,
    metadata: {
      model,
      tokens: Math.round(estimatedTokens),
      processingTime: 0, // We don't have accurate processing time from streaming
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