import axios, { AxiosResponse } from 'axios';
import { QueryMetadata, AIResponse } from '../types';
import ErrorResponse from '../utils/errorResponse';
import config from '../config/config';
import { EventEmitter } from 'events';

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
    finishReason: string;
    safetyRatings: Array<any>;
  }>;
  promptFeedback: {
    safetyRatings: Array<any>;
  };
}

/**
 * Generate a response from Gemini
 * @param query User query
 * @param stream Whether to stream the response
 * @returns Generated response with metadata or stream emitter
 */
export const generateResponse = async (query: string, stream: boolean = false): Promise<AIResponse | EventEmitter> => {
  try {
    if (!config.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    const startTime = Date.now();
    const model = config.GEMINI_MODEL;
    const apiUrl = `${config.GEMINI_API_ENDPOINT}?key=${config.GEMINI_API_KEY}`;

    // If streaming is requested, use a different approach
    if (stream) {
      return generateStreamingResponse(query, apiUrl, model);
    }

    // Make API request to Gemini
    const response: AxiosResponse<GeminiResponse> = await axios.post(
      apiUrl,
      {
        contents: [{
          parts: [{ text: query }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 3000,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Calculate processing time
    const endTime = Date.now();
    const processingTime = endTime - startTime;

    // Extract the response text
    let responseText = '';
    if (response.data.candidates && response.data.candidates.length > 0) {
      const candidate = response.data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        responseText = candidate.content.parts.map(part => part.text || '').join('');
      }
    }

    // Prepare metadata
    // Gemini doesn't provide token counts directly like OpenAI, so we approximate
    const estimatedTokens = Math.ceil((query.length + responseText.length) / 4);
    const metadata: QueryMetadata = {
      model,
      tokens: estimatedTokens,
      // Approximation based on character count
      promptTokens: Math.ceil(query.length / 4),
      completionTokens: Math.ceil(responseText.length / 4),
      processingTime
    };

    return {
      rawResponse: JSON.stringify(response.data),
      formattedResponse: responseText,
      metadata
    };
  } catch (error: any) {
    console.error('Gemini API Error:', error instanceof Error ? error.message : String(error));
    
    if (axios.isAxiosError(error) && error.response) {
      console.error('API Response:', error.response.data);
      console.error('Status:', error.response.status);
      
      throw new ErrorResponse(
        `AI service error: ${error.response?.data?.error?.message || error.message}`, 
        error.response.status
      );
    } else if (axios.isAxiosError(error) && error.request) {
      throw new ErrorResponse('No response from Gemini service. Please try again later.', 503);
    } else {
      throw new ErrorResponse(
        'Error generating Gemini response: ' + (error instanceof Error ? error.message : String(error)), 
        500
      );
    }
  }
};

/**
 * Generate a mock response for testing when API key is not available
 * @param query User query
 * @returns Mock response object
 */
export const getMockResponse = (query: string): Promise<AIResponse> => {
  // Simulate network delay
  return new Promise(resolve => {
    setTimeout(() => {
      const responseText = `This is a mock response for: "${query}"\n\nGemini would provide a real response here. Please set up your API key in the .env file to get actual responses.`;
      
      const metadata: QueryMetadata = {
        model: 'gemini-2.0-flash-mock',
        tokens: query.length + responseText.length,
        promptTokens: query.length,
        completionTokens: responseText.length,
        processingTime: 0.5,
        isMock: true
      };

      resolve({
        rawResponse: JSON.stringify({
          candidates: [{
            content: {
              parts: [{ text: responseText }]
            },
            finishReason: 'STOP',
            safetyRatings: []
          }],
          promptFeedback: {
            safetyRatings: []
          }
        }),
        formattedResponse: responseText,
        metadata
      });
    }, 500);
  });
};

/**
 * Generate a streaming response using Gemini API
 * Since Gemini doesn't support native streaming like OpenAI, we'll simulate it
 * by breaking the response into smaller chunks
 * 
 * @param query User query
 * @param apiUrl The Gemini API URL
 * @param model The model name
 * @returns An event emitter that emits 'data' events with response chunks
 */
function generateStreamingResponse(query: string, apiUrl: string, model: string): EventEmitter {
  const emitter = new EventEmitter();
  
  setTimeout(async () => {
    try {
      // Make regular API request to Gemini
      const response: AxiosResponse<GeminiResponse> = await axios.post(
        apiUrl,
        {
          contents: [{
            parts: [{ text: query }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extract the full response text
      let fullResponseText = '';
      if (response.data.candidates && response.data.candidates.length > 0) {
        const candidate = response.data.candidates[0];
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          fullResponseText = candidate.content.parts.map(part => part.text || '').join('');
        }
      }
      
      console.log('Got full response from Gemini:', fullResponseText.substring(0, 50) + '...');
      
      // Break the response into smaller chunks to simulate streaming
      const chunks = simulateStreamChunks(fullResponseText);
      
      for (const chunk of chunks) {
        // Send data directly in the format the frontend expects
        console.log(`Sending chunk: ${chunk.substring(0, 20)}...`);
        
        // Important: Frontend expects { content: "text" } format directly, not nested under choices/delta
        const dataToSend = `data: ${JSON.stringify({ content: chunk })}\n\n`;
        emitter.emit('data', Buffer.from(dataToSend));
        
        // Add a small delay between chunks to simulate streaming
        await new Promise(resolve => setTimeout(resolve, 80));
      }
      
      // Signal the end of streaming
      console.log("Sending [DONE] signal");
      emitter.emit('data', Buffer.from('data: [DONE]\n\n'));
      emitter.emit('end');
    } catch (error) {
      console.error('Error in Gemini streaming:', error);
      emitter.emit('error', error);
    }
  }, 0);
  
  return emitter;
}

/**
 * Split a text into smaller chunks to simulate streaming
 * @param text The complete text to split
 * @returns Array of text chunks
 */
function simulateStreamChunks(text: string): string[] {
  // If text is short, return it as a single chunk
  if (text.length < 20) {
    return [text];
  }
  
  const chunks: string[] = [];
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
  
  if (sentences.length === 0) {
    // If no sentences, split by words
    const words = text.split(' ');
    let currentChunk = '';
    
    for (const word of words) {
      currentChunk += word + ' ';
      if (currentChunk.length > 30 || word === words[words.length - 1]) {
        chunks.push(currentChunk.trim());
        currentChunk = '';
      }
    }
  } else {
    // If we have sentences, use them as chunks
    for (const sentence of sentences) {
      chunks.push(sentence.trim());
    }
  }
  
  return chunks;
} 