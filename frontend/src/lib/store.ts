import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';

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
}

interface HistoryState {
  history: Query[];
  isLoading: boolean;
  error: string | null;
  fetchHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
}

// API base URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
      
      register: async (username, email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/api/auth/register`, {
            username,
            email,
            password
          });
          
          localStorage.setItem('token', res.data.token);
          
          set({
            token: res.data.token,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Load user info after successful registration
          const { loadUser } = get();
          await loadUser();
        } catch (err: any) {
          localStorage.removeItem('token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: err.response?.data?.msg || 'Registration failed'
          });
        }
      },
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const res = await axios.post(`${API_URL}/api/auth/login`, {
            email,
            password
          });
          
          localStorage.setItem('token', res.data.token);
          
          set({
            token: res.data.token,
            isAuthenticated: true,
            isLoading: false
          });
          
          // Load user info after successful login
          const { loadUser } = get();
          await loadUser();
        } catch (err: any) {
          localStorage.removeItem('token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: err.response?.data?.msg || 'Login failed'
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
        const { token, lastLoaded } = state;
        
        // Don't reload if we loaded within the last 10 seconds (cache)
        const now = Date.now();
        if (lastLoaded && now - lastLoaded < 10000) {
          return;
        }
        
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        
        const config = {
          headers: {
            'x-auth-token': token
          }
        };
        
        // Only set loading if needed
        if (!state.isAuthenticated || !state.user) {
          set({ isLoading: true });
        }
        
        try {
          const res = await axios.get(`${API_URL}/api/auth/profile`, config);
          
          set({
            user: res.data,
            isAuthenticated: true,
            isLoading: false,
            lastLoaded: now
          });
        } catch (err) {
          localStorage.removeItem('token');
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Authentication failed',
            lastLoaded: null
          });
        }
      }
    }),
    {
      name: 'auth-storage',
      // Only persist token - other state will be rehydrated on load
      partialize: (state) => ({ token: state.token }),
    }
  )
);

// Create query store
export const useQueryStore = create<QueryState>((set, get) => ({
  query: '',
  response: '',
  isLoading: false,
  error: null,
  
  setQuery: (query) => set({ query }),
  
  submitQuery: async () => {
    const token = useAuthStore.getState().token;
    const query = get().query;
    
    if (!token || !query.trim()) {
      set({ error: 'Please login and enter a query' });
      return;
    }
    
    const config = {
      headers: {
        'x-auth-token': token,
        'Content-Type': 'application/json'
      }
    };
    
    set({ isLoading: true, error: null });
    
    try {
      const res = await axios.post(
        `${API_URL}/api/generate`,
        { query },
        config
      );
      
      set({
        response: res.data.response,
        isLoading: false
      });
      
      // Refresh history after new query
      useHistoryStore.getState().fetchHistory();
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.msg || 'Failed to get response'
      });
    }
  },
  
  clearQuery: () => set({ query: '' }),
  clearResponse: () => set({ response: '' })
}));

// Create history store
export const useHistoryStore = create<HistoryState>((set) => ({
  history: [],
  isLoading: false,
  error: null,
  
  fetchHistory: async () => {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      set({ error: 'Please login to view history' });
      return;
    }
    
    const config = {
      headers: {
        'x-auth-token': token
      }
    };
    
    set({ isLoading: true, error: null });
    
    try {
      const res = await axios.get(`${API_URL}/api/history`, config);
      set({
        history: res.data,
        isLoading: false
      });
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.msg || 'Failed to fetch history'
      });
    }
  },
  
  deleteHistoryItem: async (id) => {
    const token = useAuthStore.getState().token;
    
    if (!token) {
      set({ error: 'Please login to delete history' });
      return;
    }
    
    const config = {
      headers: {
        'x-auth-token': token
      }
    };
    
    set({ isLoading: true, error: null });
    
    try {
      await axios.delete(`${API_URL}/api/history/${id}`, config);
      
      // Remove the deleted item from state
      set((state) => ({
        history: state.history.filter(item => item.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.response?.data?.msg || 'Failed to delete history item'
      });
    }
  }
})); 