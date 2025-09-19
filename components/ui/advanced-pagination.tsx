'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';

interface AdvancedPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  loading?: boolean;
  maxVisiblePages?: number;
  showPageInfo?: boolean;
  showItemsPerPage?: boolean;
  itemsPerPageOptions?: number[];
  className?: string;
}

export function AdvancedPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  loading = false,
  maxVisiblePages = 5,
  showPageInfo = true,
  showItemsPerPage = false,
  itemsPerPageOptions = [10, 20, 50, 100],
  className = '',
}: AdvancedPaginationProps) {
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

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Don't render if there's only one page or no pages
  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className='flex justify-center items-center space-x-2'>
          {/* First Page Button */}
          <Button
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1 || loading}
            variant='outline'
            size='sm'
            aria-label='First page'
          >
            <ChevronsLeft className='h-4 w-4' />
          </Button>

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

          {/* Last Page Button */}
          <Button
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages || loading}
            variant='outline'
            size='sm'
            aria-label='Last page'
          >
            <ChevronsRight className='h-4 w-4' />
          </Button>
        </div>
      )}

      {/* Page Info */}
      {showPageInfo && (
        <div className='text-center text-sm text-muted-foreground'>
          {totalPages > 1 ? (
            <>
              Page {currentPage} of {totalPages} • Showing {startItem}-{endItem}{' '}
              of {totalItems} items
            </>
          ) : (
            <>
              Showing {totalItems} item{totalItems !== 1 ? 's' : ''}
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Enhanced hook for pagination with items per page
export function useAdvancedPagination(
  totalItems: number,
  initialItemsPerPage: number = 20,
  initialPage: number = 1
) {
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const offset = (currentPage - 1) * itemsPerPage;

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return {
    currentPage,
    totalPages,
    itemsPerPage,
    offset,
    totalItems,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    handlePageChange,
    handleItemsPerPageChange,
  };
}
