import api from './axios';
import { AxiosError } from 'axios';
import { ApiErrorResponse } from './queryService';

// Types for authentication
export interface RegisterUserData {
  username: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
  }
}

export interface UserProfileResponse {
  success: boolean;
  data: UserProfile;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
}

// Authentication service
const authService = {
  // Register a new user
  register: async (userData: RegisterUserData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/register', userData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Registration failed');
      }
      throw new Error('Registration failed');
    }
  },

  // Login a user
  login: async (userData: LoginUserData): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>('/api/auth/login', userData);
      return response.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Login failed');
      }
      throw new Error('Login failed');
    }
  },

  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    try {
      const response = await api.get<UserProfileResponse>('/api/auth/me');
      return response.data.data;
    } catch (error: unknown) {
      if (error instanceof AxiosError && error.response?.data) {
        const errorData = error.response.data as ApiErrorResponse;
        throw new Error(errorData.error?.message || 'Failed to get user profile');
      }
      throw new Error('Failed to get user profile');
    }
  }
};

export default authService; 