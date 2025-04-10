import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MarkdownRenderer } from '@/components/common';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface HistoryItemDetailsProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  item: {
    id: string;
    query: string;
    response: string;
    createdAt: string;
  } | null;
}

const HistoryItemDetails = ({
  isOpen,
  onOpenChange,
  onDelete,
  item
}: HistoryItemDetailsProps) => {
  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Query Details</DialogTitle>
          <DialogDescription>View the full details of your query and response</DialogDescription>
        </DialogHeader>
        <div className="grid gap-5 py-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground/80">Query</h3>
            <div className="bg-accent/30 p-3 rounded-md text-sm">{item.query}</div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground/80">Response</h3>
            <div className="bg-accent/30 p-3 rounded-md overflow-y-auto max-h-[200px]">
              <MarkdownRenderer content={item.response} className="text-sm" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button 
            type="button"
            variant="destructive"
            size="sm"
            onClick={onDelete}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <DialogClose asChild>
            <Button type="button" variant="outline" size="sm">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default HistoryItemDetails; 