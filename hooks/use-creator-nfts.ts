'use client';

import { useState, useCallback, useEffect } from 'react';
import { useAccount, useChainId } from 'wagmi';
import {
  getContractAddress,
  isSupportedChain,
} from '@/lib/contracts/addresses';
import { apiClient } from '@/lib/api';

export interface CreatorNFT {
  id: string;
  tokenId: number;
  name: string;
  image: string;
  description: string;
  collectionId?: number;
  collectionName?: string;
  isListed: boolean;
  listingPrice?: number;
  listingId?: number;
  mintedAt: string;
  metadataUri: string;
  owner: string;
  royaltyBps: number;
}

export interface CreatorCollection {
  id: number;
  name: string;
  symbol: string;
  image: string;
  description: string;
  maxSupply: number;
  currentSupply: number;
  createdAt: string;
  totalVolume: number;
  floorPrice?: number;
  creator: string;
}

export interface CreatorStats {
  totalNfts: number;
  totalCollections: number;
  listedNfts: number;
  totalVolume: number;
  recentActivity: Array<{
    id: string;
    type: 'mint' | 'list' | 'sale';
    nftName: string;
    timestamp: string;
    amount?: number;
  }>;
}

export function useCreatorNFTs() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [nfts, setNfts] = useState<CreatorNFT[]>([]);
  const [collections, setCollections] = useState<CreatorCollection[]>([]);
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get contract address for current chain
  const contractAddress = isSupportedChain(chainId)
    ? getContractAddress(chainId, 'VertixNFT')
    : undefined;

  // Note: Collections are now fetched via API instead of direct contract calls

  const fetchUserNFTs = useCallback(
    async (walletAddress: string) => {
      if (!isConnected || !isSupportedChain(chainId) || !contractAddress) {
        setError(
          'Please connect your wallet and switch to a supported network'
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // const mockNFTs: CreatorNFT[] = [
        //   {
        //     id: '1',
        //     tokenId: 1,
        //     name: 'Cool NFT #1',
        //     image: '/images/nft-placeholder.png',
        //     description: 'A really cool NFT',
        //     collectionId: 1,
        //     collectionName: 'Cool Collection',
        //     isListed: true,
        //     listingPrice: 0.5,
        //     listingId: 101,
        //     mintedAt: '2024-01-15T10:30:00Z',
        //     metadataUri: 'ipfs://QmExample1',
        //     owner: walletAddress,
        //     royaltyBps: 500,
        //   },
        //   {
        //     id: '2',
        //     tokenId: 2,
        //     name: 'Awesome Art #2',
        //     image: '/images/nft-placeholder.png',
        //     description: 'Awesome digital art',
        //     isListed: false,
        //     mintedAt: '2024-01-14T15:45:00Z',
        //     metadataUri: 'ipfs://QmExample2',
        //     owner: walletAddress,
        //     royaltyBps: 500,
        //   },
        // ];
        // Fetch user's NFTs from the backend
        const response = await apiClient.getUserNFTs(walletAddress, 100, 0);

        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to fetch NFTs');
        }

        // Convert API response to CreatorNFT format using real data
        const userNFTs: CreatorNFT[] = response.data.map(
          (nft: Record<string, unknown>) => ({
            id: String(nft.id),
            tokenId: Number(nft.token_id),
            name: String(nft.name),
            image: String(nft.image),
            description: String(nft.description),
            collectionId: nft.collection_id
              ? Number(nft.collection_id)
              : undefined,
            collectionName: nft.collection_name
              ? String(nft.collection_name)
              : undefined, // Real collection name
            isListed: Boolean(nft.is_listed),
            mintedAt: String(nft.minted_at),
            metadataUri: String(nft.metadata_uri),
            owner: String(nft.owner),
            royaltyBps: Number(nft.royalty_bps),
          })
        );

        setNfts(userNFTs);
      } catch (err) {
        console.error('Failed to fetch user NFTs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, chainId, contractAddress]
  );

  const fetchUserCollections = useCallback(
    async (walletAddress: string) => {
      if (!isConnected || !isSupportedChain(chainId) || !contractAddress) {
        setError(
          'Please connect your wallet and switch to a supported network'
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Implement actual contract calls to fetch user's collections
        // This would involve:
        // 1. Getting all collections created by the user
        // 2. Fetching collection details
        // 3. Getting collection statistics

        // For now, return mock data
        const mockCollections: CreatorCollection[] = [
          {
            id: 1,
            name: 'Cool Collection',
            symbol: 'COOL',
            image: '/images/nft-placeholder.png',
            description: 'A collection of cool NFTs',
            maxSupply: 100,
            currentSupply: 15,
            createdAt: '2024-01-10T10:30:00Z',
            totalVolume: 2.5,
            floorPrice: 0.3,
            creator: walletAddress,
          },
        ];

        setCollections(mockCollections);
      } catch (err) {
        console.error('Failed to fetch user collections:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch collections'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, chainId, contractAddress]
  );

  const fetchCreatorStats = useCallback(
    async (walletAddress: string) => {
      if (!isConnected || !isSupportedChain(chainId) || !contractAddress) {
        setError(
          'Please connect your wallet and switch to a supported network'
        );
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // TODO: Implement actual contract calls to fetch creator statistics
        // This would involve:
        // 1. Counting total NFTs owned by user
        // 2. Counting total collections created by user
        // 3. Getting listing statistics
        // 4. Calculating total volume from sales

        // For now, return mock data
        const mockStats: CreatorStats = {
          totalNfts: 12,
          totalCollections: 3,
          listedNfts: 8,
          totalVolume: 2.5,
          recentActivity: [
            {
              id: '1',
              type: 'mint',
              nftName: 'Cool NFT #1',
              timestamp: '2 hours ago',
            },
            {
              id: '2',
              type: 'list',
              nftName: 'Awesome Art #5',
              timestamp: '1 day ago',
              amount: 0.5,
            },
            {
              id: '3',
              type: 'sale',
              nftName: 'Digital Masterpiece #3',
              timestamp: '3 days ago',
              amount: 1.2,
            },
          ],
        };

        setStats(mockStats);
      } catch (err) {
        console.error('Failed to fetch creator stats:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch statistics'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isConnected, chainId, contractAddress]
  );

  const listNFT = useCallback(async (tokenId: number, price: number) => {
    // TODO: Implement NFT listing functionality
    console.log('List NFT:', { tokenId, price });
  }, []);

  const unlistNFT = useCallback(async (listingId: number) => {
    // TODO: Implement NFT unlisting functionality
    console.log('Unlist NFT:', listingId);
  }, []);

  const refreshData = useCallback(() => {
    if (address) {
      fetchUserNFTs(address);
      fetchUserCollections(address);
      fetchCreatorStats(address);
    }
  }, [address, fetchUserNFTs, fetchUserCollections, fetchCreatorStats]);

  // Auto-fetch data when wallet address changes
  useEffect(() => {
    if (address && isConnected) {
      refreshData();
    }
  }, [address, isConnected, refreshData]);

  return {
    // Data
    nfts,
    collections,
    stats,

    // State
    isLoading,
    error,
    isConnected,
    isSupportedChain: isSupportedChain(chainId),

    // Actions
    fetchUserNFTs,
    fetchUserCollections,
    fetchCreatorStats,
    listNFT,
    unlistNFT,
    refreshData,

    // Computed
    canPerformActions: isConnected && isSupportedChain(chainId) && !isLoading,
  };
}
