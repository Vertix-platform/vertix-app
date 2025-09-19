'use client';

import React, { useState, useEffect } from 'react';
import { ListingsFilters } from '@/hooks/use-listings';

interface ListingsFilterProps {
  filters: ListingsFilters;
  onFiltersChange: (filters: ListingsFilters) => void;
  isLoading?: boolean;
}

export function ListingsFilter({
  filters,
  onFiltersChange,
  isLoading,
}: ListingsFilterProps) {
  const [localFilters, setLocalFilters] = useState<ListingsFilters>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof ListingsFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // Debounce the API call
    const timeoutId = setTimeout(() => {
      onFiltersChange(newFilters);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleResetFilters = () => {
    const resetFilters = { limit: 12, offset: 0 };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  return (
    <div className=' p-6'>
      <div className='flex items-center justify-between mb-6'>
        <h2 className='text-lg font-semibold text-gray-900 dark:text-white'>
          Filters
        </h2>
        <button
          onClick={handleResetFilters}
          className='text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
        >
          Reset
        </button>
      </div>

      <div className='space-y-6'>
        {/* Price Range */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Price Range (ETH)
          </label>
          <div className='flex items-center justify-between gap-2'>
            <input
              type='number'
              placeholder='Min price'
              value={localFilters.min_price || ''}
              onChange={e =>
                handleFilterChange(
                  'min_price',
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className='flex w-full rounded-xl border h-10 p-4 text-base font-normal leading-normal'
              step='0.001'
              min='0'
            />
            <input
              type='number'
              placeholder='Max price'
              value={localFilters.max_price || ''}
              onChange={e =>
                handleFilterChange(
                  'max_price',
                  e.target.value ? parseFloat(e.target.value) : undefined
                )
              }
              className='flex w-full rounded-xl border h-10 p-4 text-base font-normal leading-normal'
              step='0.001'
              min='0'
            />
          </div>
        </div>

        {/* Listing Type */}
        <div>
          <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
            Listing Type
          </label>
          <div className='space-y-2'>
            <label className='flex items-center'>
              <input
                type='radio'
                name='listingType'
                checked={localFilters.is_auction === undefined}
                onChange={() => handleFilterChange('is_auction', undefined)}
                className='mr-2 text-blue-600 focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                All
              </span>
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                name='listingType'
                checked={localFilters.is_auction === false}
                onChange={() => handleFilterChange('is_auction', false)}
                className='mr-2 text-blue-600 focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Fixed Price
              </span>
            </label>
            <label className='flex items-center'>
              <input
                type='radio'
                name='listingType'
                checked={localFilters.is_auction === true}
                onChange={() => handleFilterChange('is_auction', true)}
                className='mr-2 text-blue-600 focus:ring-blue-500'
              />
              <span className='text-sm text-gray-700 dark:text-gray-300'>
                Auctions
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoading && (
        <div className='mt-6 flex items-center justify-center'>
          <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
          <span className='ml-2 text-sm text-gray-500 dark:text-gray-400'>
            Loading...
          </span>
        </div>
      )}
    </div>
  );
}
