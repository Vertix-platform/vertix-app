'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { type Hash } from 'viem';
import {
  getContractAddress,
  isSupportedChain,
} from '@/lib/contracts/addresses';
import { VERTIX_NFT_ABI } from '@/lib/contracts/abis/vertix-nft';
import { toast } from 'react-hot-toast';

export interface CreateCollectionParams {
  name: string;
  symbol: string;
  image: string; // IPFS URI
  maxSupply: number;
}

export interface CreateCollectionState {
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: Hash;
  collectionId?: bigint;
}

export function useCreateCollection() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const {
    writeContract,
    isPending: isWritePending,
    data: txHash,
  } = useWriteContract();

  const [state, setState] = useState<CreateCollectionState>({
    isLoading: false,
    isPending: false,
    isSuccess: false,
    error: null,
  });

  const [pendingTxHash, setPendingTxHash] = useState<Hash>();

  // Watch for transaction hash from writeContract
  useEffect(() => {
    if (txHash && !pendingTxHash) {
      setPendingTxHash(txHash);
      setState(prev => ({
        ...prev,
        transactionHash: txHash,
        isPending: true,
        isLoading: false,
      }));
    }
  }, [txHash]);

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  });

  const createCollection = useCallback(
    async (
      params: CreateCollectionParams
    ): Promise<{
      success: boolean;
      collectionId?: bigint;
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

        if (!params.name.trim() || !params.symbol.trim()) {
          const errorMsg = 'Collection name and symbol are required';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        if (params.maxSupply <= 0 || params.maxSupply > 1000) {
          const errorMsg = 'Max supply must be between 1 and 1000';
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
        const contractAddress = getContractAddress(chainId, 'VertixNFT');

        console.log('Creating collection with params:', {
          chainId,
          contractAddress,
          params,
          address,
        });

        // Call smart contract
        writeContract({
          address: contractAddress,
          abi: VERTIX_NFT_ABI,
          functionName: 'createCollection',
          args: [
            params.name.trim(),
            params.symbol.trim().toUpperCase(),
            params.image,
            params.maxSupply,
          ],
        });

        // Transaction hash will be available in the hook's state
        // We'll handle it in the useEffect below

        setState(prev => ({
          ...prev,
          isPending: true,
          isLoading: false,
        }));

        toast.loading('Creating collection...', { id: 'create-collection' });

        return { success: true };
      } catch (error) {
        console.error('Create collection error:', error);

        let errorMessage = 'Failed to create collection';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas fees';
          } else if (error.message.includes('VertixNFT__EmptyString')) {
            errorMessage = 'Collection name and symbol cannot be empty';
          } else if (error.message.includes('VertixNFT__ZeroSupply')) {
            errorMessage = 'Max supply must be greater than zero';
          } else if (
            error.message.includes('VertixNFT__ExceedsMaxCollectionSize')
          ) {
            errorMessage = 'Max supply cannot exceed 1000 NFTs';
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

        toast.error(errorMessage, { id: 'create-collection' });
        return { success: false };
      }
    },
    [isConnected, address, chainId, writeContract]
  );

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash && state.isPending) {
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        error: null,
      }));
      setPendingTxHash(undefined);
    }
  }, [isConfirmed, pendingTxHash, state.isPending]);

  // Handle confirmation error
  useEffect(() => {
    if (confirmError && pendingTxHash && state.isPending) {
      const errorMsg = 'Transaction failed to confirm';
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        error: errorMsg,
      }));
      setPendingTxHash(undefined);
    }
  }, [confirmError, pendingTxHash, state.isPending]);

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && pendingTxHash && state.isPending) {
      toast.success('Collection created successfully!', {
        id: 'create-collection',
      });
    }
  }, [isConfirmed, pendingTxHash, state.isPending]);

  // Show error toast when confirmation fails
  useEffect(() => {
    if (confirmError && pendingTxHash && state.isPending) {
      const errorMsg = 'Transaction failed to confirm';
      toast.error(errorMsg, { id: 'create-collection' });
    }
  }, [confirmError, pendingTxHash, state.isPending]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isPending: false,
      isSuccess: false,
      error: null,
    });
    setPendingTxHash(undefined);
  }, []);

  return {
    createCollection,
    reset,
    ...state,
    isWritePending,
    isConfirming,
    // Convenience computed properties
    canCreate:
      isConnected &&
      isSupportedChain(chainId) &&
      !state.isLoading &&
      !state.isPending,
    isProcessing:
      state.isLoading || state.isPending || isWritePending || isConfirming,
  };
}
