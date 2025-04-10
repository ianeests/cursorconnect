import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (value: string) => void;
}

const Pagination = ({ 
  currentPage, 
  totalPages, 
  limit, 
  onPageChange, 
  onLimitChange 
}: PaginationProps) => {
  
  // Generate page numbers for pagination display
  const getPageNumbers = () => {
    const pageNumbers = [];
    
    // Always show first page
    if (totalPages > 0) {
      pageNumbers.push(1);
    }
    
    // Add ellipsis if there are many pages before current
    if (currentPage > 3) {
      pageNumbers.push('...');
    }
    
    // Show one page before current if not adjacent to first or last
    if (currentPage > 2 && currentPage < totalPages) {
      pageNumbers.push(currentPage - 1);
    }
    
    // Show current page if not first or last
    if (currentPage > 1 && currentPage < totalPages) {
      pageNumbers.push(currentPage);
    }
    
    // Show one page after current if not adjacent to first or last
    if (currentPage < totalPages - 1 && currentPage > 0) {
      pageNumbers.push(currentPage + 1);
    }
    
    // Add ellipsis if there are many pages after current
    if (currentPage < totalPages - 2) {
      pageNumbers.push('...');
    }
    
    // Always show last page if different from first
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center space-x-2">
        <p className="text-xs text-muted-foreground whitespace-nowrap">Items per page:</p>
        <Select
          value={limit.toString()}
          onValueChange={onLimitChange}
        >
          <SelectTrigger className="h-8 w-[70px] text-xs">
            <SelectValue placeholder={limit.toString()} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5">5</SelectItem>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-1">
        {/* First page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
          <span className="sr-only">First page</span>
        </Button>
        
        {/* Previous page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="sr-only">Previous page</span>
        </Button>
        
        {/* Page numbers */}
        <div className="flex items-center space-x-1">
          {getPageNumbers().map((page, index) => 
            typeof page === 'number' ? (
              <Button
                key={index}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                className="h-7 w-7 text-xs"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={index} className="text-muted-foreground px-1">
                {page}
              </span>
            )
          )}
        </div>
        
        {/* Next page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="sr-only">Next page</span>
        </Button>
        
        {/* Last page button */}
        <Button
          variant="outline"
          size="icon"
          className="h-7 w-7"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          <ChevronsRight className="h-3.5 w-3.5" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  );
};

export default Pagination; 