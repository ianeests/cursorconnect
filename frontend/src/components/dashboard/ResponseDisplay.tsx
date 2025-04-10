import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Brain } from 'lucide-react';
import { LoadingSpinner, MarkdownRenderer } from '@/components/common';

interface ResponseDisplayProps {
  response: string | null;
  isLoading: boolean;
  isStreaming: boolean;
  onClearResponse: () => void;
}

const ResponseDisplay = ({
  response,
  isLoading,
  isStreaming,
  onClearResponse
}: ResponseDisplayProps) => {
  if (!response && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-4 text-muted-foreground">
          <Brain className="h-8 w-8 mx-auto mb-2 opacity-20" />
          <p className="text-sm">Ask a question to get started</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {response && (
        <Card className="border border-border/30 shadow-sm animate-in fade-in duration-300">
          <CardHeader className="pb-1 pt-2">
            <CardTitle className="flex items-center text-sm font-semibold">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" />
              Response {isStreaming && <LoadingSpinner size="sm" className="ml-2" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-1">
            <div className="bg-accent/30 p-3 rounded-md border border-border/20 transition-all duration-300 hover:border-primary/30 markdown-content">
              <MarkdownRenderer content={response} className="text-sm" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end py-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClearResponse}
              className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 hover:bg-destructive/10"
            >
              Clear Response
            </Button>
          </CardFooter>
        </Card>
      )}
    </>
  );
};

export default ResponseDisplay; 