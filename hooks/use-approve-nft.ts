'use client';

import React, { useState, useCallback } from 'react';
import {
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { type Hash, type Abi } from 'viem';
import {
  getContractAddress,
  isSupportedChain,
} from '@/lib/contracts/addresses';
import { toast } from 'react-hot-toast';
import vertixNftAbiJson from '@/lib/contracts/abis/VertixNFT.json';
import { usePrivy } from '@privy-io/react-auth';
import { useNftApprovalStatus } from './use-nft-approval-status';

const vertixNftAbi = vertixNftAbiJson as Abi;

export interface ApproveNftParams {
  tokenId: number;
  nftContractAddress?: string; // Optional: defaults to VertixNFT contract
}

export interface ApproveNftState {
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: Hash;
}

export function useApproveNft() {
  const { user: privyUser, authenticated } = usePrivy();
  const chainId = useChainId();

  const {
    writeContract,
    isPending: isWritePending,
    data: txHash,
    error: writeError,
  } = useWriteContract();

  const [state, setState] = useState<ApproveNftState>({
    isLoading: false,
    isPending: false,
    isSuccess: false,
    error: null,
  });

  const [currentParams, setCurrentParams] = useState<ApproveNftParams | null>(
    null
  );

  // Check current approval status
  const { refetch: refetchApproval } = useNftApprovalStatus({
    tokenId: currentParams?.tokenId,
    chainId: isSupportedChain(chainId) ? chainId : undefined,
    nftContractAddress: currentParams?.nftContractAddress as `0x${string}`,
  });

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const approveNft = useCallback(
    async (
      params: ApproveNftParams
    ): Promise<{ success: boolean; transactionHash?: Hash }> => {
      try {
        // Validation
        if (!authenticated || !privyUser?.wallet?.address) {
          const errorMsg = 'Please connect your wallet first';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        if (!isSupportedChain(chainId)) {
          const errorMsg =
            'Unsupported chain. Please switch to a supported network.';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        if (!params.tokenId) {
          const errorMsg = 'Token ID is required';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        setState(prev => ({
          ...prev,
          isLoading: true,
          isPending: false,
          error: null,
          isSuccess: false,
        }));

        // Set current params to check approval status
        setCurrentParams(params);

        // Check if already approved
        const approvalCheck = await refetchApproval();
        if (approvalCheck.data) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            isSuccess: true,
            error: null,
          }));
          toast.success('NFT is already approved for marketplace!', {
            id: 'approve-nft',
          });
          return { success: true };
        }

        // Get contract addresses
        const nftContractAddress =
          params.nftContractAddress || getContractAddress(chainId, 'VertixNFT');
        const marketplaceProxyAddress = getContractAddress(
          chainId,
          'MarketplaceProxy'
        );

        console.log('Approving NFT with params:', {
          chainId,
          nftContractAddress,
          marketplaceProxyAddress,
          tokenId: params.tokenId,
          wallet: privyUser?.wallet?.address,
        });

        // Call approve function on the NFT contract
        try {
          writeContract({
            address: nftContractAddress as `0x${string}`,
            abi: vertixNftAbi,
            functionName: 'approve',
            args: [marketplaceProxyAddress, BigInt(params.tokenId)],
            gas: BigInt(100000), // Add explicit gas limit
          });

          setState(prev => ({
            ...prev,
            isPending: true,
            isLoading: false,
            transactionHash: txHash,
          }));

          toast.loading('Approving NFT for marketplace...', {
            id: 'approve-nft',
          });

          return { success: true, transactionHash: txHash };
        } catch (writeError) {
          console.error('WriteContract error:', writeError);
          throw writeError; // Re-throw to be caught by outer catch block
        }
      } catch (error) {
        console.error('Approve NFT error:', error);

        let errorMessage = 'Failed to approve NFT';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas fees';
          } else if (error.message.includes('not owner')) {
            errorMessage = 'You do not own this NFT';
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

        toast.error(errorMessage, { id: 'approve-nft' });
        return { success: false };
      }
    },
    [
      authenticated,
      privyUser?.wallet?.address,
      chainId,
      writeContract,
      txHash,
      refetchApproval,
    ]
  );

  // Handle transaction confirmation
  const handleConfirmation = useCallback(() => {
    if (isConfirmed && txHash) {
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        error: null,
        transactionHash: txHash,
      }));
      toast.success('NFT approved for marketplace!', { id: 'approve-nft' });
    }
  }, [isConfirmed, txHash]);

  // Handle confirmation error
  const handleConfirmationError = useCallback(() => {
    if (confirmError && txHash) {
      const errorMsg = 'Transaction failed to confirm';
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        error: errorMsg,
      }));
      toast.error(errorMsg, { id: 'approve-nft' });
    }
  }, [confirmError, txHash]);

  // Call handlers when state changes
  React.useEffect(() => {
    handleConfirmation();
  }, [handleConfirmation]);

  React.useEffect(() => {
    handleConfirmationError();
  }, [handleConfirmationError]);

  // Handle writeContract errors
  React.useEffect(() => {
    if (writeError) {
      console.error('WriteContract error:', writeError);

      let errorMessage = 'Failed to approve NFT';

      if (writeError.message.includes('User rejected')) {
        errorMessage = 'Transaction cancelled by user';
      } else if (writeError.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for gas fees';
      } else if (writeError.message.includes('Internal JSON-RPC error')) {
        errorMessage = 'Network error. Please try again.';
      } else if (writeError.message.includes('not owner')) {
        errorMessage = 'You do not own this NFT';
      } else {
        errorMessage = writeError.message || 'Transaction failed';
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        isPending: false,
        error: errorMessage,
      }));

      toast.error(errorMessage, { id: 'approve-nft' });
    }
  }, [writeError]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isPending: false,
      isSuccess: false,
      error: null,
    });
  }, []);

  // Auto-reset after error to allow retry
  React.useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        if (state.error) {
          // Still has error after 3 seconds
          reset();
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.error, reset]);

  return {
    approveNft,
    reset,
    ...state,
    isWritePending,
    isConfirming,
    // Convenience computed properties
    canApprove:
      authenticated &&
      isSupportedChain(chainId) &&
      !state.isLoading &&
      !state.isPending,
    isProcessing:
      state.isLoading || state.isPending || isWritePending || isConfirming,
  };
}
