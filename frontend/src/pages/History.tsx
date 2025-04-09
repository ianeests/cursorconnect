import { useEffect, useCallback, useState } from 'react';
import { useHistoryStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Trash2, Clock, Search, History as HistoryIcon, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const History = () => {
  // Use individual selectors instead of object selector to prevent re-renders
  const history = useHistoryStore((state) => state.history);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const error = useHistoryStore((state) => state.error);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);
  
  // Get authentication state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const loadUser = useAuthStore((state) => state.loadUser);
  
  // Local loading state for retry operations
  const [isRetrying, setIsRetrying] = useState(false);

  // Memoize the fetchHistory call to prevent unnecessary re-renders
  const loadHistory = useCallback(async () => {
    if (!isAuthenticated || !token) {
      console.log('User not authenticated, attempting to reload user data');
      try {
        await loadUser();
      } catch (err) {
        console.error('Failed to load user data:', err);
      }
    }
    
    fetchHistory();
  }, [fetchHistory, isAuthenticated, token, loadUser]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Format date function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PP p');
  };
  
  // Retry loading history with fresh authentication
  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await loadUser(); // First refresh auth
      await fetchHistory(); // Then try to fetch history again
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in-50 duration-500">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 rounded-full text-xs border border-primary/20 text-primary/90 bg-primary/5 transition-all duration-300 hover:scale-105">
          <HistoryIcon className="h-3.5 w-3.5" />
          <span className="font-medium">History</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mt-3 tracking-tight">
          Your Conversations
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          View and manage your past interactions with CursorAI
        </p>
      </div>

      <Card className="border border-border/30 shadow-sm transition-all duration-300 hover:shadow-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-semibold">
            <Clock className="h-4 w-4 mr-2 text-primary" />
            Past Queries
          </CardTitle>
          <CardDescription className="text-xs">
            A record of your previous questions and AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading || isRetrying ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground mt-2 font-medium">Loading your history...</p>
              </div>
            </div>
          ) : error ? (
            <div className="space-y-4">
              <Alert variant="destructive" className="text-sm py-2">
                <AlertCircle className="h-3.5 w-3.5" />
                <AlertDescription className="text-xs font-medium">{error}</AlertDescription>
              </Alert>
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRetry}
                  className="text-xs font-medium transition-all duration-300 hover:bg-accent/50 hover:border-primary/30"
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No queries found</p>
              <p className="text-xs text-muted-foreground/80 mt-1 leading-relaxed">Start by asking a question on the home page</p>
            </div>
          ) : (
            <div className="rounded-md border border-border/40 overflow-hidden transition-all duration-300 hover:border-border/60">
              <Table>
                <TableHeader className="bg-accent/30">
                  <TableRow>
                    <TableHead className="text-xs font-semibold text-foreground/70">Query</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/70">Response</TableHead>
                    <TableHead className="text-xs font-semibold text-foreground/70">Date</TableHead>
                    <TableHead className="w-[60px] text-xs font-semibold text-foreground/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow 
                      key={item.id} 
                      className="group hover:bg-accent/20 transition-colors text-sm"
                    >
                      <TableCell className="font-medium max-w-[160px] truncate text-xs">
                        <span className="group-hover:text-primary transition-colors duration-300">
                          {item.query}
                        </span>
                      </TableCell>
                      <TableCell className="max-w-[280px] truncate text-xs">
                        {item.response}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDate(item.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteHistoryItem(item.id)}
                          title="Delete"
                          className={cn(
                            "h-7 w-7 p-0 rounded-full",
                            "opacity-70 group-hover:opacity-100",
                            "hover:bg-destructive/10 hover:text-destructive", 
                            "transition-all duration-300"
                          )}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default History; 