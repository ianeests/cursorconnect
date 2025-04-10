import api from './axios';
import { AxiosError } from 'axios';

// Types for query operations
export interface QueryRequest {
  query: string;
}

export interface QueryMetadata {
  model: string;
  tokens: number;
  promptTokens?: number;
  completionTokens?: number;
  processingTime: number;
  isMock?: boolean;
}

export interface GenerateApiResponse {
  success: boolean;
  data: {
    id: string;
    query: string;
    response: string;
    formattedResponse: string;
    rawResponse: string;
    metadata: QueryMetadata;
    createdAt: string;
  }
}

export interface QueryResponse {
  response: string;
}

export interface HistoryItem {
  _id: string;
  query: string;
  response: string;
  createdAt: string;
}

export interface PaginatedHistoryResponse {
  success: boolean;
  count: number;
  total: number;
  pagination: {
    page: number;
    limit: number;
    pages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  data: HistoryItem[];
}

export interface ApiErrorResponse {
  success: boolean;
  error: {
    message: string;
    stack?: string;
  };
}

// Stream response callback type
export type StreamResponseCallback = (chunk: string, done: boolean) => void;

// Query service for handling AI queries and history
const queryService = {
  // Submit a query to the AI
  submitQuery: async (queryData: QueryRequest): Promise<QueryResponse> => {
    try {
      const response = await api.post<GenerateApiResponse>('/api/generate/stream', queryData);
      return { response: response.data.data.formattedResponse };
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to get AI response');
      }
      throw new Error('Failed to get AI response');
    }
  },

  // Submit a streaming query to the AI
  submitStreamQuery: (queryData: QueryRequest, callback: StreamResponseCallback): (() => void) => {
    const token = localStorage.getItem('token');
    if (!token) {
      callback('', true);
      throw new Error('Authentication required');
    }

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const url = `${baseUrl}/api/generate/stream`;
    
    // Create headers
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Authorization', `Bearer ${token}`);
    
    // Create POST request with proper headers
    const controller = new AbortController();
    const { signal } = controller;
    
    // Store response text in a closure
    let responseText = '';
    
    fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(queryData),
      signal,
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      
      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body reader could not be created');
      
      const decoder = new TextDecoder();
      
      // Define the recursive function with proper return type
      function processStream(): Promise<void> {
        // Use non-null assertion since we've checked reader exists
        return reader!.read().then(({ done, value }) => {
          if (done) {
            callback(responseText, true);
            return;
          }
          
          // Process the received chunk
          const chunk = decoder.decode(value, { stream: true });
          
          // Split by newlines to get individual SSE messages
          const lines = chunk.split('\n\n');
          
          lines.forEach(line => {
            if (line.trim() === '') return;
            
            // Remove 'data: ' prefix from SSE format
            const dataLine = line.replace(/^data: /, '').trim();
            
            if (dataLine === '[DONE]') {
              callback(responseText, true);
              return;
            }
            
            try {
              const data = JSON.parse(dataLine);
              
              if (data.content) {
                responseText += data.content;
                callback(responseText, false);
              } else if (data.error) {
                console.error('Stream error:', data.error);
                callback(responseText, true);
              }
            } catch (err) {
              console.warn('Could not parse SSE data:', dataLine);
            }
          });
          
          // Continue processing the stream
          return processStream();
        });
      }
      
      return processStream();
    })
    .catch(error => {
      console.error('Stream request error:', error);
      callback(responseText, true);
    });
    
    // Return a function to abort the stream
    return () => {
      controller.abort();
    };
  },

  // Get query history with pagination
  getHistory: async (page: number = 1, limit: number = 10): Promise<{
    items: HistoryItem[];
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }
  }> => {
    try {
      const response = await api.get<PaginatedHistoryResponse>(`/api/history?page=${page}&limit=${limit}`);
      
      return {
        items: response.data.data,
        pagination: {
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          pages: response.data.pagination.pages,
          total: response.data.total,
          hasNextPage: response.data.pagination.hasNextPage,
          hasPrevPage: response.data.pagination.hasPrevPage
        }
      };
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to fetch history');
      }
      throw new Error('Failed to fetch history');
    }
  },

  // Get a specific history item
  getHistoryItem: async (id: string): Promise<HistoryItem> => {
    try {
      const response = await api.get<{success: boolean, data: HistoryItem}>(`/api/history/${id}`);
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to fetch history item');
      }
      throw new Error('Failed to fetch history item');
    }
  },

  // Delete a history item
  deleteHistoryItem: async (id: string): Promise<void> => {
    try {
      await api.delete(`/api/history/${id}`);
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to delete history item');
      }
      throw new Error('Failed to delete history item');
    }
  }
};

export default queryService; 