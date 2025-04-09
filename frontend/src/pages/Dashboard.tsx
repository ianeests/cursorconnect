import { useEffect, useCallback } from 'react';
import { useQueryStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, Send, Sparkles, RefreshCw } from 'lucide-react';
import { ErrorAlert, LoadingSpinner } from '@/components/common';
import { cn } from '@/lib/utils';

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);
  const query = useQueryStore((state) => state.query);
  const response = useQueryStore((state) => state.response);
  const isLoading = useQueryStore((state) => state.isLoading);
  const error = useQueryStore((state) => state.error);
  const setQuery = useQueryStore((state) => state.setQuery);
  const submitQuery = useQueryStore((state) => state.submitQuery);
  const clearQuery = useQueryStore((state) => state.clearQuery);
  const clearResponse = useQueryStore((state) => state.clearResponse);
  const clearError = useQueryStore((state) => state.clearError);

  const handleClearResponse = useCallback(() => {
    clearResponse();
  }, [clearResponse]);

  useEffect(() => {
    return () => {
      handleClearResponse();
    };
  }, [handleClearResponse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuery();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-in fade-in-50 duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 rounded-full text-xs border border-primary/20 text-primary/90 bg-primary/5 transition-transform hover:scale-105 duration-300">
          <Brain className="h-3.5 w-3.5" />
          <span className="font-medium">Cursor AI Powered</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mt-3 tracking-tight">
          Welcome, <span className="text-primary">{user?.username || 'User'}</span>
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          Ask anything and get instant AI-powered responses
        </p>
      </div>

      <Card className="border border-border/30 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-semibold">
            <Brain className="h-4 w-4 mr-2 text-primary" />
            Ask a question
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your question below to get an AI-generated response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <ErrorAlert message={error} onClose={clearError} duration={8000} />
            
            <div className="relative group">
              <Textarea
                placeholder="Ask your question here..."
                className="min-h-[120px] resize-none border-border/40 focus:border-primary/50 text-sm transition-colors duration-300 focus:ring-1 focus:ring-primary/30"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
              <div className="absolute inset-0 rounded-md border border-primary/0 group-focus-within:border-primary/20 pointer-events-none transition-all duration-500" />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className={cn(
                  "text-sm font-medium bg-primary/90 hover:bg-primary transition-all duration-300",
                  "hover:shadow-md hover:shadow-primary/10",
                  isLoading && "opacity-90"
                )}
                size="sm"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-1.5">Processing</span>
                  </div>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3.5 w-3.5" />
                    Submit
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  clearQuery();
                  clearResponse();
                }}
                className="text-sm font-medium border-border/40 hover:bg-accent/50 transition-all duration-300"
                disabled={isLoading || (!query && !response)}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {response && (
        <Card className="border border-border/30 shadow-sm animate-in slide-in-from-bottom-5 duration-500">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="flex items-center text-base font-semibold">
              <Sparkles className="h-4 w-4 mr-2 text-primary" />
              Response
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="whitespace-pre-wrap bg-accent/30 p-4 rounded-md border border-border/20 text-sm leading-relaxed transition-all duration-300 hover:border-primary/30">
              {response}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearResponse}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 hover:bg-destructive/10"
            >
              Clear Response
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Dashboard; 