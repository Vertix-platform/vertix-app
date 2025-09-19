'use client';

import React, { useState } from 'react';
import { useListings, ListingsFilters } from '@/hooks/use-listings';
import { ListingCard } from '@/components/cards/listing-card';
import { ListingSkeletonGrid } from '@/components/ui/listing-skeleton';
import { ListingsFilter } from '@/components/sidebar/listings-filter';
import { AdvancedPagination } from '@/components/ui/advanced-pagination';

export default function MarketplacePage() {
  const [filters, setFilters] = useState<ListingsFilters>({
    limit: 12,
    offset: 0,
  });

  const { listings, isLoading, error, refetch } = useListings(filters);

  const handleFiltersChange = (newFilters: ListingsFilters) => {
    setFilters({ ...newFilters, offset: 0 }); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    const newOffset = (page - 1) * (filters.limit || 12);
    setFilters({ ...filters, offset: newOffset });
  };

  const totalPages = Math.ceil((listings.length || 0) / (filters.limit || 12));
  const currentPage =
    Math.floor((filters.offset || 0) / (filters.limit || 12)) + 1;

  return (
    <div className='min-h-screen'>
      <div className='container mx-auto'>
        {/* Header */}
        <div className='mb-8'>
          <h1 className='text-3xl font-bold '>Marketplace</h1>
          <p className=''>Discover and trade digital assets</p>
        </div>

        <div className='flex flex-col lg:flex-row gap-4'>
          {/* Sidebar Filters */}
          <div className='lg:w-80 flex-shrink-0'>
            <div className='sticky top-8'>
              <ListingsFilter
                filters={filters}
                onFiltersChange={handleFiltersChange}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            {/* Results Header */}
            <div className='mb-6 flex items-center justify-between'>
              <div>
                <h2 className='text-xl font-semibold'>
                  {isLoading
                    ? 'Loading...'
                    : `${listings.length} Listings Found`}
                </h2>
                {filters.seller_address && (
                  <p className='text-sm '>
                    Filtered by seller: {filters.seller_address.slice(0, 10)}...
                  </p>
                )}
              </div>

              {/* Sort Options */}
              <div className='flex items-center gap-4'>
                <span className='text-sm '>Sort by:</span>
                <select className='px-3 py-1 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm'>
                  <option>Recently Listed</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Ending Soon</option>
                </select>
              </div>
            </div>

            {/* Listings Grid */}
            {isLoading ? (
              <ListingSkeletonGrid count={filters.limit || 12} />
            ) : listings.length > 0 ? (
              <>
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 mb-8'>
                  {listings.map(listing => (
                    <ListingCard key={listing.listing_id} listing={listing} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className='flex justify-center'>
                    <AdvancedPagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      totalItems={100}
                      itemsPerPage={12}
                      maxVisiblePages={5}
                    />
                  </div>
                )}
              </>
            ) : (
              /* Empty State */
              <div className='text-center py-12'>
                <svg
                  className='mx-auto h-12 w-12 text-gray-400 dark:text-gray-500'
                  fill='none'
                  viewBox='0 0 24 24'
                  stroke='currentColor'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={1}
                    d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
                  />
                </svg>
                <h3 className='mt-2 text-sm font-medium text-gray-900 dark:text-white'>
                  No listings found
                </h3>
                <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                  Try adjusting your filters or check back later for new
                  listings.
                </p>
                <div className='mt-6'>
                  <button
                    onClick={() => setFilters({ limit: 12, offset: 0 })}
                    className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
