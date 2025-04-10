import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Send, RefreshCw, StopCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/common';
import { cn } from '@/lib/utils';

interface QueryInputProps {
  query: string;
  isLoading: boolean;
  isStreaming: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClear: () => void;
  onAbort: () => void;
}

const QueryInput = ({
  query,
  isLoading,
  isStreaming,
  onQueryChange,
  onSubmit,
  onClear,
  onAbort
}: QueryInputProps) => {
  return (
    <Card className="border border-border/30 shadow-sm transition-all duration-300">
      <CardContent className="pt-3 pb-3">
        <form onSubmit={onSubmit} className="space-y-2">
          <div className="relative group">
            <Textarea
              placeholder="Ask your question here..."
              className="min-h-[60px] max-h-[100px] resize-none border-border/40 focus:border-primary/50 text-sm transition-colors duration-300 focus:ring-1 focus:ring-primary/30"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              disabled={isLoading}
            />
            <div className="absolute inset-0 rounded-md border border-primary/0 group-focus-within:border-primary/20 pointer-events-none transition-all duration-500" />
          </div>
          
          <div className="flex gap-2">
            {isStreaming ? (
              <Button 
                type="button" 
                className={cn(
                  "text-xs font-medium bg-destructive/90 hover:bg-destructive transition-all duration-300",
                  "hover:shadow-md hover:shadow-destructive/10"
                )}
                size="sm"
                onClick={onAbort}
              >
                <StopCircle className="mr-1 h-3 w-3" />
                Stop
              </Button>
            ) : (
              <Button 
                type="submit" 
                className={cn(
                  "text-xs font-medium bg-primary/90 hover:bg-primary transition-all duration-300",
                  "hover:shadow-md hover:shadow-primary/10",
                  isLoading && "opacity-90"
                )}
                size="sm"
                disabled={isLoading || !query.trim()}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <LoadingSpinner size="sm" />
                    <span className="ml-1">Processing</span>
                  </div>
                ) : (
                  <>
                    <Send className="mr-1 h-3 w-3" />
                    Submit
                  </>
                )}
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClear}
              className="text-xs font-medium border-border/40 hover:bg-accent/50 transition-all duration-300"
              disabled={isLoading || (!query && !isStreaming)}
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default QueryInput; 