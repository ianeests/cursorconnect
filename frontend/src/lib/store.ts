// Add proper imports with type assertions to prevent TypeScript errors
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, queryService } from '../api';
import { RegisterUserData, LoginUserData } from '../api/authService';
import { QueryRequest } from '../api/queryService';

// Define types
interface User {
  id: string;
  username: string;
  email: string;
}

interface Query {
  id: string;
  query: string;
  response: string;
  createdAt: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastLoaded: number | null;
  register: (username: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

interface QueryState {
  query: string;
  response: string;
  isLoading: boolean;
  error: string | null;
  isStreaming: boolean;
  streamAbortController: (() => void) | null;
  setQuery: (query: string) => void;
  submitQuery: () => Promise<void>;
  submitStreamQuery: () => void;
  clearQuery: () => void;
  clearResponse: () => void;
  clearError: () => void;
  abortStream: () => void;
}

interface HistoryState {
  history: Query[];
  isLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    pages: number;
    total: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  fetchHistory: (page?: number, limit?: number) => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearError: () => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
}

// Create auth store with persistence
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: localStorage.getItem('token'),
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      lastLoaded: null,
      
      register: async (username: string, email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userData: RegisterUserData = { username, email, password };
          const response = await authService.register(userData);
          
          localStorage.setItem('token', response.token);
          
          set({
            token: response.token,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed'
          });
        }
      },
      
      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const userData: LoginUserData = { email, password };
          const response = await authService.login(userData);
          
          localStorage.setItem('token', response.token);
          
          set({
            token: response.token,
            user: response.user,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          localStorage.removeItem('token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Login failed'
          });
        }
      },
      
      logout: () => {
        localStorage.removeItem('token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          lastLoaded: null
        });
      },
      
      loadUser: async () => {
        const state = get();
        // Try both storage locations for token
        const token = localStorage.getItem('token') || state.token;
        
        // Don't reload if we loaded within the last 10 seconds (cache)
        const now = Date.now();
        if (state.lastLoaded && now - state.lastLoaded < 10000) {
          console.log('Using cached user data, loaded recently');
          return;
        }
        
        if (!token) {
          console.log('No token found, user not authenticated');
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        // Only set loading if needed
        if (!state.isAuthenticated || !state.user) {
          set({ isLoading: true });
        }
        
        try {
          console.log('Fetching current user profile...');
          const user = await authService.getCurrentUser();
          
          // Update token in store if it was only in localStorage
          set({
            token: token, // Ensure token is in store
            user,
            isAuthenticated: true,
            isLoading: false,
            lastLoaded: now
          });
          console.log('User profile loaded successfully:', user.username);
        } catch (error) {
          console.error('Failed to load user profile:', error);
          // Clear token from both store and localStorage
          localStorage.removeItem('token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Authentication failed',
            lastLoaded: null
          });
        }
      },
      
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Create query store
export const useQueryStore = create<QueryState>()(
  (set, get) => ({
    query: '',
    response: '',
    isLoading: false,
    error: null,
    isStreaming: false,
    streamAbortController: null,
    
    setQuery: (query: string) => set({ query }),
    
    submitQuery: async () => {
      const query = get().query;
      
      if (!query.trim()) {
        set({ error: 'Please enter a query' });
        return;
      }
      
      set({ isLoading: true, error: null });
      
      try {
        const queryData: QueryRequest = { query };
        console.log('Submitting query:', queryData);
        const result = await queryService.submitQuery(queryData);
        
        // Get the response correctly from the result
        console.log('API Response:', result);
        console.log('Response type:', typeof result);
        console.log('Response properties:', Object.keys(result));
        
        set({
          response: result.response,
          isLoading: false
        });
        
        // Verify the state update
        setTimeout(() => {
          console.log('Updated state:', get());
        }, 100);
        
        // Refresh history after new query
        useHistoryStore.getState().fetchHistory();
      } catch (error) {
        console.error('Query error:', error);
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to get response'
        });
      }
    },
    
    submitStreamQuery: () => {
      const query = get().query;
      
      if (!query.trim()) {
        set({ error: 'Please enter a query' });
        return;
      }
      
      set({ 
        isLoading: true, 
        isStreaming: true,
        error: null,
        response: '' // Clear previous response
      });
      
      try {
        const queryData: QueryRequest = { query };
        console.log('Submitting streaming query:', queryData);
        
        // Start streaming and get abort controller
        const abortController = queryService.submitStreamQuery(
          queryData, 
          (chunk: string, done: boolean) => {
            // Update response with each chunk
            set({ response: chunk });
            
            // When stream is done
            if (done) {
              set({ 
                isLoading: false,
                isStreaming: false,
                streamAbortController: null
              });
              
              // Refresh history after streaming is complete
              useHistoryStore.getState().fetchHistory();
            }
          }
        );
        
        // Store abort controller for cancellation
        set({ streamAbortController: abortController });
        
      } catch (error) {
        console.error('Streaming query error:', error);
        set({
          isLoading: false,
          isStreaming: false,
          streamAbortController: null,
          error: error instanceof Error ? error.message : 'Failed to get streaming response'
        });
      }
    },
    
    abortStream: () => {
      const { streamAbortController } = get();
      if (streamAbortController) {
        streamAbortController();
        set({ 
          isLoading: false,
          isStreaming: false,
          streamAbortController: null
        });
      }
    },
    
    clearQuery: () => set({ query: '' }),
    clearResponse: () => set({ response: '' }),
    clearError: () => set({ error: null })
  })
);

// Create history store
export const useHistoryStore = create<HistoryState>()(
  (set, get) => ({
    history: [],
    isLoading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      pages: 1,
      total: 0,
      hasNextPage: false,
      hasPrevPage: false
    },
    
    fetchHistory: async (page?: number, limit?: number) => {
      set({ isLoading: true, error: null });
      
      // Use provided page/limit or get from state
      const currentPage = page || get().pagination.page;
      const currentLimit = limit || get().pagination.limit;
      
      try {
        const result = await queryService.getHistory(currentPage, currentLimit);
        
        // Map HistoryItem to Query (convert _id to id)
        const history = result.items.map(item => ({
          id: item._id,
          query: item.query,
          response: item.response,
          createdAt: item.createdAt
        }));
        
        set({
          history,
          pagination: result.pagination,
          isLoading: false
        });
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to fetch history'
        });
      }
    },
    
    deleteHistoryItem: async (id: string) => {
      set({ isLoading: true, error: null });
      
      try {
        await queryService.deleteHistoryItem(id);
        
        // Remove the deleted item from state
        set((state) => ({
          history: state.history.filter(item => item.id !== id),
          isLoading: false
        }));
        
        // Refetch current page if it's empty (except for page 1)
        const state = get();
        if (state.history.length === 0 && state.pagination.page > 1) {
          await get().fetchHistory(state.pagination.page - 1);
        } else if (state.pagination.page === 1) {
          // Just refetch current page to update counts
          await get().fetchHistory(1);
        }
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete history item'
        });
      }
    },
    
    setPage: (page: number) => {
      set((state) => ({
        pagination: {
          ...state.pagination,
          page
        }
      }));
      get().fetchHistory(page);
    },
    
    setLimit: (limit: number) => {
      set((state) => ({
        pagination: {
          ...state.pagination,
          limit
        }
      }));
      get().fetchHistory(1, limit); // Reset to page 1 when changing limit
    },
    
    clearError: () => set({ error: null })
  })
); 