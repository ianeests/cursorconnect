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
  setQuery: (query: string) => void;
  submitQuery: () => Promise<void>;
  clearQuery: () => void;
  clearResponse: () => void;
  clearError: () => void;
}

interface HistoryState {
  history: Query[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  clearError: () => void;
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
        const result = await queryService.submitQuery(queryData);
        
        set({
          response: result.response,
          isLoading: false
        });
        
        // Refresh history after new query
        useHistoryStore.getState().fetchHistory();
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to get response'
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
  (set) => ({
    history: [],
    isLoading: false,
    error: null,
    
    fetchHistory: async () => {
      set({ isLoading: true, error: null });
      
      try {
        const history = await queryService.getHistory();
        set({
          history,
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
      } catch (error) {
        set({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to delete history item'
        });
      }
    },
    
    clearError: () => set({ error: null })
  })
); 