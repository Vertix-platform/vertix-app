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

export interface PlaceBidParams {
  auctionId: number; // Auction ID to bid on
  bidAmount: string; // Bid amount in wei (as string to handle large numbers)
}

export interface PlaceBidState {
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: Hash;
}

export function usePlaceBid() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isPending: isWritePending, data: txHash } = useWriteContract();

  const {
    sendTransaction,
    isPending: isSendPending,
    data: sendTxHash,
  } = useSendTransaction();

  const [state, setState] = useState<PlaceBidState>({
    isLoading: false,
    isPending: false,
    isSuccess: false,
    error: null,
  });

  const [pendingTxHash, setPendingTxHash] = useState<Hash>();
  const processedTxHash = useRef<Hash | undefined>(undefined);

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

  const placeBid = useCallback(
    async (
      params: PlaceBidParams
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

        if (!params.auctionId || !params.bidAmount) {
          const errorMsg = 'Auction ID and bid amount are required';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        // Validate bid amount is positive
        const bidAmountBigInt = BigInt(params.bidAmount);
        if (bidAmountBigInt <= 0) {
          const errorMsg = 'Bid amount must be greater than 0';
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

        console.log('Placing bid with params:', {
          chainId,
          contractAddress,
          params,
          address,
        });

        // Place bid using placeBid function
        const functionSelector = toHex(
          keccak256(toHex('placeBid(uint256)')).slice(0, 4)
        );

        const encodedParams = encodeAbiParameters(
          [{ name: 'auctionId', type: 'uint256' }],
          [BigInt(params.auctionId)]
        );

        sendTransaction({
          to: contractAddress,
          data: (functionSelector + encodedParams.slice(2)) as `0x${string}`,
          value: bidAmountBigInt,
        });

        setState(prev => ({
          ...prev,
          isPending: true,
          isLoading: false,
        }));

        toast.loading('Placing bid...', { id: 'place-bid' });

        return { success: true };
      } catch (error) {
        console.error('Place bid error:', error);

        let errorMessage = 'Failed to place bid';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for bid';
          } else if (error.message.includes('MA__AuctionInactive')) {
            errorMessage = 'Auction is no longer active';
          } else if (error.message.includes('MA__AuctionExpired')) {
            errorMessage = 'Auction has expired';
          } else if (error.message.includes('MA__BidTooLow')) {
            errorMessage = 'Bid amount is too low';
          } else if (error.message.includes('MA__InsufficientBalance')) {
            errorMessage = 'Insufficient contract balance for refund';
          } else if (error.message.includes('MA__TransferFailed')) {
            errorMessage = 'Refund transfer failed';
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

        toast.error(errorMessage, { id: 'place-bid' });
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
      toast.success('Bid placed successfully!', { id: 'place-bid' });
    }
  }, [isConfirmed, pendingTxHash]);

  // Show error toast when confirmation fails
  useEffect(() => {
    if (confirmError && pendingTxHash) {
      const errorMsg = 'Transaction failed to confirm';
      toast.error(errorMsg, { id: 'place-bid' });
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
    placeBid,
    reset,
    ...state,
    isWritePending: isWritePending || isSendPending,
    isConfirming,
    // Convenience computed properties
    canBid:
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
