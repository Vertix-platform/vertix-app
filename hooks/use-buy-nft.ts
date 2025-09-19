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

export interface BuyNftParams {
  listingId: number; // Listing ID to buy
  price: string; // Price in wei (as string to handle large numbers)
  targetChain?: number; // Optional target chain for cross-chain purchase (0 for same chain)
}

export interface BuyNftState {
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: Hash;
}

export function useBuyNft() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { isPending: isWritePending, data: txHash } = useWriteContract();

  const {
    sendTransaction,
    isPending: isSendPending,
    data: sendTxHash,
  } = useSendTransaction();

  const [state, setState] = useState<BuyNftState>({
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

  const buyNft = useCallback(
    async (
      params: BuyNftParams
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

        if (!params.listingId || !params.price) {
          const errorMsg = 'Listing ID and price are required';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        // Validate price is positive
        const priceBigInt = BigInt(params.price);
        if (priceBigInt <= 0) {
          const errorMsg = 'Price must be greater than 0';
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

        console.log('Buying NFT with params:', {
          chainId,
          contractAddress,
          params,
          address,
        });

        if (params.targetChain !== undefined && params.targetChain !== 0) {
          // Cross-chain purchase
          const functionSelector = toHex(
            keccak256(toHex('buyNftWithBridge(uint256,uint8)')).slice(0, 4)
          );

          const encodedParams = encodeAbiParameters(
            [
              { name: 'listingId', type: 'uint256' },
              { name: 'targetChain', type: 'uint8' },
            ],
            [BigInt(params.listingId), params.targetChain]
          );

          sendTransaction({
            to: contractAddress,
            data: (functionSelector + encodedParams.slice(2)) as `0x${string}`,
            value: priceBigInt,
          });
        } else {
          // Same-chain purchase
          const functionSelector = toHex(
            keccak256(toHex('buyNft(uint256)')).slice(0, 4)
          );

          const encodedParams = encodeAbiParameters(
            [{ name: 'listingId', type: 'uint256' }],
            [BigInt(params.listingId)]
          );

          sendTransaction({
            to: contractAddress,
            data: (functionSelector + encodedParams.slice(2)) as `0x${string}`,
            value: priceBigInt,
          });
        }

        setState(prev => ({
          ...prev,
          isPending: true,
          isLoading: false,
        }));

        toast.loading('Buying NFT...', { id: 'buy-nft' });

        return { success: true };
      } catch (error) {
        console.error('Buy NFT error:', error);

        let errorMessage = 'Failed to buy NFT';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for purchase';
          } else if (error.message.includes('MC__InvalidListing')) {
            errorMessage = 'Invalid or inactive listing';
          } else if (error.message.includes('MC__InsufficientPayment')) {
            errorMessage = 'Insufficient payment amount';
          } else if (error.message.includes('MC__TransferFailed')) {
            errorMessage = 'NFT transfer failed';
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

        toast.error(errorMessage, { id: 'buy-nft' });
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
      toast.success('NFT purchased successfully!', { id: 'buy-nft' });
    }
  }, [isConfirmed, pendingTxHash]);

  // Show error toast when confirmation fails
  useEffect(() => {
    if (confirmError && pendingTxHash) {
      const errorMsg = 'Transaction failed to confirm';
      toast.error(errorMsg, { id: 'buy-nft' });
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
    buyNft,
    reset,
    ...state,
    isWritePending: isWritePending || isSendPending,
    isConfirming,
    // Convenience computed properties
    canBuy:
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
