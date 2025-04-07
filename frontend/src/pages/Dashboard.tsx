import { useEffect, useCallback } from 'react';
import { useQueryStore, useAuthStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, Send, Brain, Sparkles } from 'lucide-react';

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
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 rounded-full text-xs border border-primary/20 text-primary/90 bg-primary/5">
          <Brain className="h-3 w-3" />
          <span>Cursor AI Powered</span>
        </div>
        <h1 className="text-2xl font-medium text-foreground mt-3">
          Welcome, {user?.username || 'User'}
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Ask anything and get instant AI-powered responses
        </p>
      </div>

      <Card className="border border-border/30 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-medium">
            <Brain className="h-4 w-4 mr-2 text-primary/80" />
            Ask a question
          </CardTitle>
          <CardDescription className="text-xs">
            Enter your question below to get an AI-generated response
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="text-sm py-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs">{error}</AlertDescription>
              </Alert>
            )}
            
            <div>
              <Textarea
                placeholder="Ask your question here..."
                className="min-h-[120px] resize-none border-border/40 focus:border-primary/50 text-sm"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                type="submit" 
                className="text-xs bg-primary/90 hover:bg-primary" 
                size="sm"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                    Processing
                  </>
                ) : (
                  <>
                    <Send className="mr-1.5 h-3 w-3" />
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
                className="text-xs border-border/40"
                disabled={isLoading || (!query && !response)}
              >
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {response && (
        <Card className="border border-border/30 shadow-sm">
          <CardHeader className="pb-2 pt-3">
            <CardTitle className="flex items-center text-base font-medium">
              <Sparkles className="h-4 w-4 mr-2 text-primary/80" />
              Response
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="whitespace-pre-wrap bg-accent/30 p-4 rounded-md border border-border/20 text-sm">
              {response}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end py-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleClearResponse}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default Dashboard; 