'use client';

import { useReadContract } from 'wagmi';
import { type Address, type Abi } from 'viem';
import {
  getContractAddress,
  isSupportedChain,
} from '@/lib/contracts/addresses';
import vertixNftAbiJson from '@/lib/contracts/abis/VertixNFT.json';

const vertixNftAbi = vertixNftAbiJson as Abi;

export interface UseNftApprovalStatusParams {
  tokenId?: number;
  chainId?: number;
  nftContractAddress?: Address;
}

export function useNftApprovalStatus({
  tokenId,
  chainId,
  nftContractAddress,
}: UseNftApprovalStatusParams) {
  // Determine contract addresses
  const effectiveChainId = chainId;
  const nftAddress =
    nftContractAddress ||
    (effectiveChainId && isSupportedChain(effectiveChainId)
      ? getContractAddress(effectiveChainId, 'VertixNFT')
      : undefined);

  const marketplaceProxyAddress =
    effectiveChainId && isSupportedChain(effectiveChainId)
      ? getContractAddress(effectiveChainId, 'MarketplaceProxy')
      : undefined;

  // Check if NFT is approved for the marketplace
  const {
    data: approvedAddress,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: nftAddress,
    abi: vertixNftAbi,
    functionName: 'getApproved',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: Boolean(tokenId && nftAddress && marketplaceProxyAddress),
    },
  });

  // Check if the approved address matches the marketplace proxy
  const isApproved = Boolean(
    approvedAddress &&
      marketplaceProxyAddress &&
      (approvedAddress as Address).toLowerCase() ===
        marketplaceProxyAddress.toLowerCase()
  );

  return {
    isApproved,
    approvedAddress: approvedAddress as Address | undefined,
    isLoading,
    error,
    refetch,
  };
}
