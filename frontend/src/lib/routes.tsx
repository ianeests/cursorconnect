import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';

// Import page components (to be created)
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import History from '../pages/History';
import Layout from '../components/Layout';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Guest route component (redirect if already logged in)
const GuestRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  
  // Don't redirect if still loading auth status or processing login
  if (isLoading) {
    return <>{children}</>;
  }
  
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

// Create router
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'history',
        element: (
          <ProtectedRoute>
            <History />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: (
          <GuestRoute>
            <Login />
          </GuestRoute>
        ),
      },
      {
        path: 'register',
        element: (
          <GuestRoute>
            <Register />
          </GuestRoute>
        ),
      },
    ],
  },
]); 