'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
  useSendTransaction,
} from 'wagmi';
import { type Hash, encodeAbiParameters, keccak256, toHex } from 'viem';
import {
  getContractAddress,
  isSupportedChain,
} from '@/lib/contracts/addresses';
import { toast } from 'react-hot-toast';

export interface CancelNftListingParams {
  listingId: number; // Listing ID to cancel
}

export interface CancelNftListingState {
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: Hash;
}

export function useCancelNftListing() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isPending: isWritePending, data: txHash } = useWriteContract();

  const {
    sendTransaction,
    isPending: isSendPending,
    data: sendTxHash,
  } = useSendTransaction();

  const [state, setState] = useState<CancelNftListingState>({
    isLoading: false,
    isPending: false,
    isSuccess: false,
    error: null,
  });

  const [pendingTxHash, setPendingTxHash] = useState<Hash>();
  const processedTxHash = useRef<Hash | undefined>(undefined);

  // Watch for transaction hash from writeContract or sendTransaction
  useEffect(() => {
    const currentTxHash = txHash || sendTxHash;
    if (currentTxHash && currentTxHash !== processedTxHash.current) {
      processedTxHash.current = currentTxHash;
      setPendingTxHash(currentTxHash);
      setState(prev => ({
        ...prev,
        transactionHash: currentTxHash,
        isPending: true,
        isLoading: false,
      }));
    }
  }, [txHash, sendTxHash]);

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  const cancelNftListing = useCallback(
    async (
      params: CancelNftListingParams
    ): Promise<{
      success: boolean;
      transactionHash?: Hash;
    }> => {
      try {
        // Validation
        if (!isConnected || !address) {
          const errorMsg = 'Please connect your wallet first';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        if (!isSupportedChain(chainId)) {
          const errorMsg = `Unsupported chain. Please switch to a supported network.`;
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        if (!params.listingId || params.listingId <= 0) {
          const errorMsg = 'Valid listing ID is required';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        setState(prev => ({
          ...prev,
          isLoading: true,
          isPending: true,
          error: null,
          isSuccess: false,
        }));

        // Get contract address for current chain
        const contractAddress = getContractAddress(chainId, 'MarketplaceProxy');

        console.log('Canceling NFT listing with params:', {
          chainId,
          contractAddress,
          params,
          address,
        });

        const functionSelector = toHex(
          keccak256(toHex('cancelNftListing(uint256)')).slice(0, 4)
        );

        const encodedParams = encodeAbiParameters(
          [{ name: 'listingId', type: 'uint256' }],
          [BigInt(params.listingId)]
        );

        sendTransaction({
          to: contractAddress,
          data: (functionSelector + encodedParams.slice(2)) as `0x${string}`,
        });

        setState(prev => ({
          ...prev,
          isPending: true,
          isLoading: false,
        }));

        toast.loading('Canceling NFT listing...', { id: 'cancel-nft-listing' });

        return { success: true };
      } catch (error) {
        console.error('Cancel NFT listing error:', error);

        let errorMessage = 'Failed to cancel NFT listing';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas fees';
          } else if (error.message.includes('MC__InvalidListing')) {
            errorMessage = 'Invalid or inactive listing';
          } else if (error.message.includes('MC__NotSeller')) {
            errorMessage = 'You are not the seller of this listing';
          } else {
            errorMessage = error.message;
          }
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isPending: false,
          error: errorMessage,
        }));

        toast.error(errorMessage, { id: 'cancel-nft-listing' });
        return { success: false };
      }
    },
    [isConnected, address, chainId, sendTransaction]
  );

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        error: null,
      }));
      setPendingTxHash(undefined);
    }
  }, [isConfirmed, pendingTxHash]);

  // Handle confirmation error
  useEffect(() => {
    if (confirmError && pendingTxHash) {
      const errorMsg = 'Transaction failed to confirm';
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        error: errorMsg,
      }));
      setPendingTxHash(undefined);
    }
  }, [confirmError, pendingTxHash]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      toast.success('NFT listing canceled successfully!', {
        id: 'cancel-nft-listing',
      });
    }
  }, [isConfirmed, pendingTxHash]);

  // Show error toast when confirmation fails
  useEffect(() => {
    if (confirmError && pendingTxHash) {
      const errorMsg = 'Transaction failed to confirm';
      toast.error(errorMsg, { id: 'cancel-nft-listing' });
    }
  }, [confirmError, pendingTxHash]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isPending: false,
      isSuccess: false,
      error: null,
    });
    setPendingTxHash(undefined);
    processedTxHash.current = undefined;
  }, []);

  return {
    cancelNftListing,
    reset,
    ...state,
    isWritePending: isWritePending || isSendPending,
    isConfirming,
    // Convenience computed properties
    canCancel:
      isConnected &&
      isSupportedChain(chainId) &&
      !state.isLoading &&
      !state.isPending,
    isProcessing:
      state.isLoading ||
      state.isPending ||
      isWritePending ||
      isSendPending ||
      isConfirming,
  };
}
