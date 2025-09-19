'use client';

import { useState, useEffect, useCallback } from 'react';
import { authConfig, API_ENDPOINTS } from '@/lib/config';

export interface Listing {
  listing_id: number;
  nft_contract: string;
  token_id: number;
  seller_address: string;
  price_wei: string;
  is_auction: boolean;
  auction_end_time?: string;
  reserve_price_wei?: string;
  transaction_hash: string;
  block_number: number;
  event_type: string;
  created_at: string;

  // Asset Type Information
  asset_type: number; // 0=NFT, 1=Social Media, 2=Website, 3=Domain, 4=Application, 5=YouTube, 6=Other
  asset_type_name: string;

  // Asset Details
  name: string;
  description: string;
  image: string;
  external_url?: string;
  animation_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  collection_name: string;

  // Royalty info
  royalty_recipient: string;
  royalty_bps: number;

  // Metadata
  token_uri: string;
  metadata_hash: string;
}

export interface ListingsResponse {
  success: boolean;
  data: Listing[];
  message: string;
}

export interface ListingsFilters {
  limit?: number;
  offset?: number;
  seller_address?: string;
  collection_address?: string;
  min_price?: number; // in ETH
  max_price?: number; // in ETH
  is_auction?: boolean;
}

export function useListings(filters: ListingsFilters = {}) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(
    async (newFilters = filters) => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query parameters
        const params = new URLSearchParams();

        if (newFilters.limit)
          params.append('limit', newFilters.limit.toString());
        if (newFilters.offset)
          params.append('offset', newFilters.offset.toString());
        if (newFilters.seller_address)
          params.append('seller_address', newFilters.seller_address);
        if (newFilters.collection_address)
          params.append('collection_address', newFilters.collection_address);
        if (newFilters.min_price)
          params.append('min_price', newFilters.min_price.toString());
        if (newFilters.max_price)
          params.append('max_price', newFilters.max_price.toString());
        if (newFilters.is_auction !== undefined)
          params.append('is_auction', newFilters.is_auction.toString());

        const url = `${authConfig.RUST_BACKEND_URL}${API_ENDPOINTS.CONTRACT.LISTINGS}?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: ListingsResponse = await response.json();

        if (result.success) {
          setListings(result.data);
        } else {
          setError(result.message || 'Failed to fetch listings');
        }
      } catch (err) {
        console.error('Error fetching listings:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch listings'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    error,
    refetch: fetchListings,
  };
}
