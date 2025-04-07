import { useEffect, useCallback } from 'react';
import { useHistoryStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Trash2, Clock, Search, History as HistoryIcon } from 'lucide-react';
import { format } from 'date-fns';

const History = () => {
  // Use individual selectors instead of object selector to prevent re-renders
  const history = useHistoryStore((state) => state.history);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const error = useHistoryStore((state) => state.error);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);

  // Memoize the fetchHistory call to prevent unnecessary re-renders
  const loadHistory = useCallback(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Format date function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PP p');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center space-x-2 px-3 py-1 rounded-full text-xs border border-primary/20 text-primary/90 bg-primary/5">
          <HistoryIcon className="h-3 w-3" />
          <span>History</span>
        </div>
        <h1 className="text-2xl font-medium text-foreground mt-3">
          Your Conversations
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          View and manage your past interactions with CursorAI
        </p>
      </div>

      <Card className="border border-border/30 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-base font-medium">
            <Clock className="h-4 w-4 mr-2 text-primary/80" />
            Past Queries
          </CardTitle>
          <CardDescription className="text-xs">
            A record of your previous questions and AI responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary/80" />
                <p className="text-xs text-muted-foreground mt-2">Loading your history...</p>
              </div>
            </div>
          ) : error ? (
            <Alert variant="destructive" className="text-sm py-2">
              <AlertCircle className="h-3.5 w-3.5" />
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          ) : history.length === 0 ? (
            <div className="text-center py-10 px-4">
              <Search className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground font-medium">No queries found</p>
              <p className="text-xs text-muted-foreground/80 mt-1">Start by asking a question on the home page</p>
            </div>
          ) : (
            <div className="rounded-md border border-border/40 overflow-hidden">
              <Table>
                <TableHeader className="bg-accent/30">
                  <TableRow>
                    <TableHead className="text-xs font-medium text-foreground/70">Query</TableHead>
                    <TableHead className="text-xs font-medium text-foreground/70">Response</TableHead>
                    <TableHead className="text-xs font-medium text-foreground/70">Date</TableHead>
                    <TableHead className="w-[60px] text-xs font-medium text-foreground/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => (
                    <TableRow key={item.id} className="hover:bg-accent/20 transition-colors text-sm">
                      <TableCell className="font-medium max-w-[160px] truncate text-xs">
                        {item.query}
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
                          className="h-7 w-7 p-0 rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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