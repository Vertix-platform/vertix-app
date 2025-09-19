'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import { Listing } from './use-listings';

export function useListingDetails(listingId: string) {
  const [listing, setListing] = useState<Listing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListingDetails = useCallback(async () => {
    if (!listingId) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient.getListingById(listingId);

      if (result.success && result.data) {
        setListing(result.data);
      } else {
        setError(result.error || 'Failed to fetch listing details');
      }
    } catch (err) {
      console.error('Error fetching listing details:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to fetch listing details'
      );
    } finally {
      setIsLoading(false);
    }
  }, [listingId]);

  useEffect(() => {
    fetchListingDetails();
  }, [fetchListingDetails]);

  return {
    listing,
    isLoading,
    error,
    refetch: fetchListingDetails,
  };
}
