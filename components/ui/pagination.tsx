'use client';

import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
  maxVisiblePages?: number;
  showPageInfo?: boolean;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  loading = false,
  maxVisiblePages = 5,
  showPageInfo = true,
  className = '',
}: PaginationProps) {
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && !loading) {
      onPageChange(page);
    }
  };

  const generatePageNumbers = () => {
    const pages = [];

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      const start = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
      const end = Math.min(totalPages, start + maxVisiblePages - 1);

      // Adjust start if we're near the end
      const adjustedStart = Math.max(1, end - maxVisiblePages + 1);

      for (let i = adjustedStart; i <= end; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className={`flex flex-col items-center space-y-2 ${className}`}>
      {/* Pagination Controls */}
      <div className='flex justify-center items-center space-x-2'>
        {/* Previous Button */}
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1 || loading}
          variant='outline'
          size='sm'
          aria-label='Previous page'
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        {/* Page Numbers */}
        {generatePageNumbers().map(page => (
          <Button
            key={page}
            onClick={() => handlePageChange(page)}
            disabled={loading}
            variant={currentPage === page ? 'default' : 'outline'}
            size='sm'
            className='min-w-[40px]'
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? 'page' : undefined}
          >
            {page}
          </Button>
        ))}

        {/* Next Button */}
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages || loading}
          variant='outline'
          size='sm'
          aria-label='Next page'
        >
          <ChevronRight className='h-4 w-4' />
        </Button>
      </div>

      {/* Page Info */}
      {showPageInfo && (
        <div className='text-center text-sm text-muted-foreground'>
          Page {currentPage} of {totalPages}
        </div>
      )}
    </div>
  );
}

// Hook for pagination logic
export function usePagination(
  totalItems: number,
  itemsPerPage: number,
  initialPage: number = 1
) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentPage = Math.min(Math.max(initialPage, 1), totalPages);
  const offset = (currentPage - 1) * itemsPerPage;

  return {
    currentPage,
    totalPages,
    offset,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
  };
}
