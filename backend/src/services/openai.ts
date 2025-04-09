import { Configuration, OpenAIApi } from 'openai';
import { QueryMetadata } from '../types';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

/**
 * Generate a response from OpenAI
 * @param query User query
 * @param stream Whether to stream the response
 * @returns Generated response or response stream
 */
export const generateResponse = async (query: string, stream: boolean = false): Promise<any> => {
  if (!configuration.apiKey) {
    throw new Error('OpenAI API key is not configured');
  }

  const startTime = Date.now();
  const model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  try {
    const completion = await openai.createChatCompletion({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: query },
      ],
      stream,
      temperature: 0.7,
    }, stream ? { responseType: 'stream' } : undefined);

    if (stream) {
      // Return the stream directly for streaming responses
      return completion.data;
    }

    // For non-streaming response, process normally
    const endTime = Date.now();
    const processingTime = endTime - startTime;
    
    const rawResponse = completion.data.choices[0].message?.content || '';
    const tokens = completion.data.usage?.total_tokens || 0;

    const metadata: QueryMetadata = {
      model,
      tokens,
      processingTime,
    };

    return {
      rawResponse,
      metadata,
    };
  } catch (error: any) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      throw new Error(`OpenAI API error: ${error.response.data.error.message}`);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      throw new Error('An error occurred during your request.');
    }
  }
}; 