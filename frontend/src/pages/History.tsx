import { useEffect, useCallback, useState } from 'react';
import { useHistoryStore, useAuthStore } from '@/lib/store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, Clock, History as HistoryIcon, RefreshCw } from 'lucide-react';
import { toast } from "sonner";
import { DeleteConfirmationDialog, HistoryItemDetails, HistoryTable } from '@/components/history';
import { Pagination } from '@/components/common';

interface HistoryItem {
  id: string;
  query: string;
  response: string;
  createdAt: string;
}

const History = () => {
  // Use individual selectors instead of object selector to prevent re-renders
  const history = useHistoryStore((state) => state.history);
  const isLoading = useHistoryStore((state) => state.isLoading);
  const error = useHistoryStore((state) => state.error);
  const pagination = useHistoryStore((state) => state.pagination);
  const fetchHistory = useHistoryStore((state) => state.fetchHistory);
  const deleteHistoryItem = useHistoryStore((state) => state.deleteHistoryItem);
  const setPage = useHistoryStore((state) => state.setPage);
  const setLimit = useHistoryStore((state) => state.setLimit);
  
  // Get authentication state
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = useAuthStore((state) => state.token);
  const loadUser = useAuthStore((state) => state.loadUser);
  
  // Local loading state for retry operations
  const [isRetrying, setIsRetrying] = useState(false);
  
  // State for dialogs
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);

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

  // Handle item detail view
  const showItemDetails = (item: HistoryItem) => {
    setSelectedItem(item);
  };

  // Handle item deletion with confirmation
  const handleDeleteItem = async (id: string) => {
    try {
      await deleteHistoryItem(id);
      setIsDeleteDialogOpen(false);
      toast.success("Item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete item");
      console.error("Delete error:", error);
    }
  };

  // Pagination handlers
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (value: string) => {
    setLimit(parseInt(value));
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
          ) : (
            <>
              <HistoryTable 
                history={history}
                onDeleteClick={(item) => {
                  showItemDetails(item);
                  setIsDeleteDialogOpen(true);
                }}
                onItemClick={(item) => {
                  showItemDetails(item);
                  setIsDetailsDialogOpen(true);
                }}
              />
              
              {/* Pagination */}
              {pagination.pages > 0 && (
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.pages}
                  limit={pagination.limit}
                  onPageChange={handlePageChange}
                  onLimitChange={handleLimitChange}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {selectedItem && (
        <>
          <DeleteConfirmationDialog
            isOpen={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
            onDelete={handleDeleteItem}
            item={selectedItem}
          />
          
          <HistoryItemDetails
            isOpen={isDetailsDialogOpen}
            onOpenChange={setIsDetailsDialogOpen}
            onDelete={() => {
              setIsDetailsDialogOpen(false);
              setIsDeleteDialogOpen(true);
            }}
            item={selectedItem}
          />
        </>
      )}
    </div>
  );
};

export default History;