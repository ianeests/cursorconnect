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
    metadata: QueryMetadata;
    createdAt: string;
  }
}

export interface QueryResponse {
  response: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  response: string;
  createdAt: string;
}

export interface ApiErrorResponse {
  success: boolean;
  error: {
    message: string;
    stack?: string;
  };
}

// Query service for handling AI queries and history
const queryService = {
  // Submit a query to the AI
  submitQuery: async (queryData: QueryRequest): Promise<QueryResponse> => {
    try {
      const response = await api.post<GenerateApiResponse>('/api/generate', queryData);
      return { response: response.data.data.response };
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to get AI response');
      }
      throw new Error('Failed to get AI response');
    }
  },

  // Get query history
  getHistory: async (): Promise<HistoryItem[]> => {
    try {
      const response = await api.get<{success: boolean, data: HistoryItem[]}>('/api/history');
      return response.data.data;
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