import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '../lib/store';

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token') || useAuthStore.getState().token;
    
    if (token) {
      // Add token to Authorization header with Bearer prefix
      config.headers['Authorization'] = `Bearer ${token}`;
    } else {
      console.warn('No auth token available for request to:', config.url);
    }
    
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Log detailed error information for debugging
    console.error('API Error:', {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method,
      message: error.message,
      responseData: error.response?.data
    });
    
    // Handle session expiration
    if (error.response?.status === 401) {
      console.log('Authentication error detected, logging out user');
      // Log the user out if token is expired/invalid
      useAuthStore.getState().logout();
      // Redirect to login if needed
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 