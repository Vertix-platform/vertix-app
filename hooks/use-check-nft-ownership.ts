'use client';

import { useReadContract } from 'wagmi';
import { type Address, type Abi } from 'viem';
import {
  getContractAddress,
  isSupportedChain,
} from '@/lib/contracts/addresses';
import vertixNftAbiJson from '@/lib/contracts/abis/VertixNFT.json';

const vertixNftAbi = vertixNftAbiJson as Abi;

export interface UseCheckNftOwnershipParams {
  tokenId?: number;
  chainId?: number;
  nftContractAddress?: Address;
  userAddress?: Address;
}

export function useCheckNftOwnership({
  tokenId,
  chainId,
  nftContractAddress,
  userAddress,
}: UseCheckNftOwnershipParams) {
  // Determine contract address
  const nftAddress =
    nftContractAddress ||
    (chainId && isSupportedChain(chainId)
      ? getContractAddress(chainId, 'VertixNFT')
      : undefined);

  // Check owner of the NFT
  const {
    data: owner,
    isLoading: isCheckingOwner,
    error: ownerError,
    refetch: refetchOwner,
  } = useReadContract({
    address: nftAddress,
    abi: vertixNftAbi,
    functionName: 'ownerOf',
    args: tokenId ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: Boolean(tokenId && nftAddress),
    },
  });

  // Check if user owns the NFT
  const isOwner = Boolean(
    owner &&
      userAddress &&
      (owner as Address).toLowerCase() === userAddress.toLowerCase()
  );

  return {
    owner: owner as Address | undefined,
    isOwner,
    isCheckingOwner,
    ownerError,
    refetchOwner,
  };
}
