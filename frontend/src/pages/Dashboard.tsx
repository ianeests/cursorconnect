import { useEffect, useCallback } from 'react';
import { useQueryStore, useAuthStore } from '@/lib/store';
import { Brain } from 'lucide-react';
import { ErrorAlert } from '@/components/common';
import { QueryInput, ResponseDisplay } from '@/components/dashboard';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const query = useQueryStore((state) => state.query);
  const response = useQueryStore((state) => state.response);
  const isLoading = useQueryStore((state) => state.isLoading);
  const isStreaming = useQueryStore((state) => state.isStreaming);
  const error = useQueryStore((state) => state.error);
  const setQuery = useQueryStore((state) => state.setQuery);
  const submitStreamQuery = useQueryStore((state) => state.submitStreamQuery);
  const abortStream = useQueryStore((state) => state.abortStream);
  const clearQuery = useQueryStore((state) => state.clearQuery);
  const clearResponse = useQueryStore((state) => state.clearResponse);
  const clearError = useQueryStore((state) => state.clearError);

  const handleClearResponse = useCallback(() => {
    clearResponse();
  }, [clearResponse]);

  useEffect(() => {
    // Add a class to the body to prevent scrolling
    document.body.classList.add('overflow-hidden');
    
    return () => {
      handleClearResponse();
      // Cancel any active streams when component unmounts
      abortStream();
      // Remove the class when component unmounts
      document.body.classList.remove('overflow-hidden');
    };
  }, [handleClearResponse, abortStream]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitStreamQuery(); // Use streaming by default
  };

  const handleClear = () => {
    clearQuery();
    clearResponse();
    abortStream(); // Cancel any active streams
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-3xl mx-auto px-4">
      {/* Header section */}
      <div className="text-center py-2 flex-shrink-0">
        <div className="inline-flex items-center justify-center space-x-2 px-2 py-1 rounded-full text-xs border border-primary/20 text-primary/90 bg-primary/5">
          <Brain className="h-3 w-3" />
          <span className="font-medium">Cursor AI Powered</span>
        </div>
        <h1 className="text-lg font-semibold text-foreground mt-1 tracking-tight">
          Welcome, <span className="text-primary">{user?.username || 'User'}</span>
        </h1>
      </div>

      {/* Response area - With scrolling only if needed */}
      <div className="flex-grow overflow-y-auto mb-3 pr-1 code-blocks-container" style={{ height: 'calc(100vh - 250px)' }}>
        <ResponseDisplay
          response={response}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onClearResponse={handleClearResponse}
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="mb-2 flex-shrink-0">
          <ErrorAlert message={error} onClose={clearError} duration={8000} />
        </div>
      )}

      {/* Input area - Now at the bottom */}
      <div className="flex-shrink-0 mb-3">
        <QueryInput
          query={query}
          isLoading={isLoading}
          isStreaming={isStreaming}
          onQueryChange={setQuery}
          onSubmit={handleSubmit}
          onClear={handleClear}
          onAbort={abortStream}
        />
      </div>
    </div>
  );
};

export default Dashboard; 