'use client';

import { useState, useEffect, useCallback } from 'react';
import { authConfig, API_ENDPOINTS } from '@/lib/config';
import { usePrivy } from '@privy-io/react-auth';

export interface UserNft {
  id: string;
  token_id: number;
  collection_id?: number;
  collection_name: string;
  chain_id: number;
  owner: string;
  transaction_hash: string;
  block_number: number;
  minted_at: string;
  name: string;
  description: string;
  image: string;
  metadata_uri: string;
  is_listed: boolean;
  listing_price?: number;
  listing_id?: number;
  is_auction: boolean;
  royalty_bps: number;
}

export interface UserNftsResponse {
  success: boolean;
  data: UserNft[];
  message: string;
}

export function useUserNfts() {
  const { user: privyUser, authenticated } = usePrivy();
  const [nfts, setNfts] = useState<UserNft[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserNfts = useCallback(
    async (limit = 100, offset = 0) => {
      if (!privyUser?.wallet?.address || !authenticated) {
        setNfts([]);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const url = `${authConfig.RUST_BACKEND_URL}${API_ENDPOINTS.CONTRACT.USER_NFTS}?wallet_address=${privyUser?.wallet?.address}&limit=${limit}&offset=${offset}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: UserNftsResponse = await response.json();

        if (result.success) {
          setNfts(result.data);
        } else {
          setError(result.message || 'Failed to fetch NFTs');
        }
      } catch (err) {
        console.error('Error fetching user NFTs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
      } finally {
        setIsLoading(false);
      }
    },
    [privyUser?.wallet?.address, authenticated]
  );

  useEffect(() => {
    fetchUserNfts();
  }, [fetchUserNfts]);

  return {
    nfts,
    isLoading,
    error,
    refetch: fetchUserNfts,
  };
}
