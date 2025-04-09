import { useEffect, useCallback, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./lib/routes";
import { useAuthStore } from "./lib/store";
import { Loader2 } from "lucide-react";

function App() {
  // Get the loadUser function directly from the store
  const loadUser = useAuthStore((state) => state.loadUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isInitializing, setIsInitializing] = useState(true);

  // Create a memoized function that handles authentication safely
  const initializeAuth = useCallback(async () => {
    try {
      await loadUser();
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      setIsInitializing(false);
    }
  }, [loadUser]);

  // Only run the effect once when the component mounts
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Show loading spinner while initializing authentication
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return <RouterProvider router={router} />;
}

export default App;
