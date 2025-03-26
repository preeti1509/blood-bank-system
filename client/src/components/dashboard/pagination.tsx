import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 3; // How many page numbers to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
    
    // Adjust if we're near the end
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => !isFirstPage && onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="h-8 w-8 p-0"
      >
        <span className="material-icons text-sm">chevron_left</span>
      </Button>
      
      {getPageNumbers().map(page => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => onPageChange(page)}
          className={`h-8 w-8 p-0 ${page === currentPage ? 'bg-blue-600 text-white' : ''}`}
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => !isLastPage && onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="h-8 w-8 p-0"
      >
        <span className="material-icons text-sm">chevron_right</span>
      </Button>
    </div>
  );
}
