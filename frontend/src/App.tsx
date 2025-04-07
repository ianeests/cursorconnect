import { useEffect, useCallback } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./lib/routes";
import { useAuthStore } from "./lib/store";

function App() {
  // Get the loadUser function directly from the store
  const loadUser = useAuthStore((state) => state.loadUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Create a memoized function that handles authentication safely
  const initializeAuth = useCallback(async () => {
    if (!isAuthenticated) {
      await loadUser();
    }
  }, [loadUser, isAuthenticated]);

  // Only run the effect once when the component mounts
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <RouterProvider router={router} />;
}

export default App;
