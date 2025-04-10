import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface HistoryItem {
  id: string;
  query: string;
  response: string;
  createdAt: string;
}

interface HistoryTableProps {
  history: HistoryItem[];
  onDeleteClick: (item: HistoryItem) => void;
  onItemClick: (item: HistoryItem) => void;
}

const HistoryTable = ({ history, onDeleteClick, onItemClick }: HistoryTableProps) => {
  // Format date function
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PP p');
  };

  return (
    <>
      {history.length === 0 ? (
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
                  className="group hover:bg-accent/20 transition-colors text-sm cursor-pointer"
                  onClick={() => onItemClick(item)}
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
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        onDeleteClick(item);
                      }}
                      title="Delete"
                      className={cn(
                        "h-7 w-7 p-0 rounded-full",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                        "hover:bg-destructive/10 hover:text-destructive"
                      )}
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
    </>
  );
};

export default HistoryTable; 