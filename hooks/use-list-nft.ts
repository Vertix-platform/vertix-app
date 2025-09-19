'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useChainId,
} from 'wagmi';
import { type Hash, type Abi } from 'viem';
import {
  getContractAddress,
  isSupportedChain,
  type ChainId,
} from '@/lib/contracts/addresses';
import { toast } from 'react-hot-toast';
import marketplaceCoreAbiJson from '@/lib/contracts/abis/MarketplaceCore.json';
import { useNftApprovalStatus } from './use-nft-approval-status';
import { useApproveNft } from './use-approve-nft';

const marketplaceCoreAbi = marketplaceCoreAbiJson as Abi;

export interface ListNftParams {
  nftContractAddr: string; // NFT contract address
  tokenId: number; // Token ID to list
  price: string; // Price in wei (as string to handle large numbers)
  enableCrossChain?: boolean; // Optional cross-chain listing
}

export interface ListNftState {
  isLoading: boolean;
  isPending: boolean;
  isSuccess: boolean;
  error: string | null;
  transactionHash?: Hash;
  listingId?: bigint;
  needsApproval: boolean;
  isApproving: boolean;
}

export function useListNft() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  const {
    writeContract,
    isPending: isWritePending,
    data: txHash,
  } = useWriteContract();

  const [state, setState] = useState<ListNftState>({
    isLoading: false,
    isPending: false,
    isSuccess: false,
    error: null,
    needsApproval: false,
    isApproving: false,
  });

  const [pendingParams, setPendingParams] = useState<ListNftParams | null>(
    null
  );

  // NFT approval hooks
  const { refetch: refetchApproval } = useNftApprovalStatus({
    tokenId: pendingParams?.tokenId,
    chainId: isSupportedChain(chainId) ? (chainId as ChainId) : undefined,
    nftContractAddress: pendingParams?.nftContractAddr as `0x${string}`,
  });

  const {
    approveNft,
    isSuccess: isApprovalSuccess,
    isProcessing: isApprovalProcessing,
    error: approvalError,
  } = useApproveNft();

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({
    hash: txHash,
  });

  const proceedWithListing = useCallback(
    (params: ListNftParams) => {
      try {
        setState(prev => ({
          ...prev,
          isLoading: true,
          isPending: false,
          error: null,
          isSuccess: false,
        }));

        // Validate price is positive
        const priceBigInt = BigInt(params.price);
        if (priceBigInt <= 0) {
          throw new Error('Price must be greater than 0');
        }

        // Get contract address for current chain
        const contractAddress = getContractAddress(
          chainId as ChainId,
          'MarketplaceProxy'
        );

        console.log('Listing NFT with params:', {
          chainId,
          contractAddress,
          params,
          address,
        });

        // Call listNft function on MarketplaceProxy using MarketplaceCore ABI
        writeContract({
          address: contractAddress,
          abi: marketplaceCoreAbi,
          functionName: params.enableCrossChain
            ? 'listNftCrossChain'
            : 'listNft',
          args: params.enableCrossChain
            ? [
                params.nftContractAddr as `0x${string}`,
                BigInt(params.tokenId),
                priceBigInt,
                params.enableCrossChain,
              ]
            : [
                params.nftContractAddr as `0x${string}`,
                BigInt(params.tokenId),
                priceBigInt,
              ],
        });

        setState(prev => ({
          ...prev,
          isPending: true,
          isLoading: false,
        }));

        toast.loading('Listing NFT...', { id: 'list-nft' });
      } catch (error) {
        console.error('List NFT error:', error);

        let errorMessage = 'Failed to list NFT';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isPending: false,
          error: errorMessage,
        }));

        toast.error(errorMessage, { id: 'list-nft' });
        setPendingParams(null);
      }
    },
    [chainId, address, writeContract]
  );

  // Handle approval success
  useEffect(() => {
    if (isApprovalSuccess && pendingParams) {
      // Refetch approval status and proceed with listing
      refetchApproval().then(() => {
        setState(prev => ({
          ...prev,
          isApproving: false,
          needsApproval: false,
        }));
        // Proceed with listing after approval
        proceedWithListing(pendingParams);
      });
    }
  }, [isApprovalSuccess, pendingParams, refetchApproval, proceedWithListing]);

  // Handle approval error
  useEffect(() => {
    if (approvalError) {
      console.error('Approval error in list NFT hook:', approvalError);
      setState(prev => ({
        ...prev,
        isApproving: false,
        isLoading: false,
        isPending: false,
        error: `Approval failed: ${approvalError}`,
      }));
      setPendingParams(null);
      toast.error(`Approval failed: ${approvalError}`, { id: 'list-nft' });
    }
  }, [approvalError]);

  const listNft = useCallback(
    async (
      params: ListNftParams
    ): Promise<{
      success: boolean;
      listingId?: bigint;
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
          const errorMsg =
            'Unsupported chain. Please switch to a supported network.';
          setState(prev => ({ ...prev, error: errorMsg }));
          toast.error(errorMsg);
          return { success: false };
        }

        if (!params.nftContractAddr || !params.tokenId || !params.price) {
          const errorMsg = 'All listing parameters are required';
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

        // Set pending params for approval check
        setPendingParams(params);

        // Check if NFT is approved for marketplace
        const approvalStatus = await refetchApproval();

        if (!approvalStatus.data) {
          // Need to approve first
          setState(prev => ({
            ...prev,
            needsApproval: true,
            isApproving: true,
          }));

          toast('NFT needs approval for marketplace', { id: 'list-nft' });

          const approvalResult = await approveNft({
            tokenId: params.tokenId,
            nftContractAddress: params.nftContractAddr as `0x${string}`,
          });

          if (!approvalResult.success) {
            setState(prev => ({
              ...prev,
              needsApproval: false,
              isApproving: false,
              error: 'NFT approval failed',
            }));
            setPendingParams(null);
            return { success: false };
          }

          // Approval is in progress, the useEffect will handle proceeding with listing
          return { success: true };
        } else {
          // Already approved, proceed with listing
          setState(prev => ({ ...prev, needsApproval: false }));
          proceedWithListing(params);
          return { success: true };
        }
      } catch (error) {
        console.error('List NFT error:', error);

        let errorMessage = 'Failed to list NFT';

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user';
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas fees';
          } else if (error.message.includes('MC__InvalidNFTContract')) {
            errorMessage = 'Invalid NFT contract address';
          } else if (error.message.includes('MC__NotOwner')) {
            errorMessage = 'You do not own this NFT';
          } else if (error.message.includes('MC__DuplicateListing')) {
            errorMessage = 'This NFT is already listed';
          } else if (error.message.includes('MC__InsufficientPayment')) {
            errorMessage = 'Invalid price amount';
          } else {
            errorMessage = error.message;
          }
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isPending: false,
          error: errorMessage,
          needsApproval: false,
          isApproving: false,
        }));

        toast.error(errorMessage, { id: 'list-nft' });
        setPendingParams(null);
        return { success: false };
      }
    },
    [
      isConnected,
      address,
      chainId,
      refetchApproval,
      approveNft,
      proceedWithListing,
    ]
  );

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && txHash) {
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        error: null,
        transactionHash: txHash,
      }));
      toast.success('NFT listed successfully!', { id: 'list-nft' });
      setPendingParams(null);
    }
  }, [isConfirmed, txHash]);

  // Handle confirmation error
  useEffect(() => {
    if (confirmError && txHash) {
      const errorMsg = 'Transaction failed to confirm';
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        error: errorMsg,
      }));
      toast.error(errorMsg, { id: 'list-nft' });
      setPendingParams(null);
    }
  }, [confirmError, txHash]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isPending: false,
      isSuccess: false,
      error: null,
      needsApproval: false,
      isApproving: false,
    });
    setPendingParams(null);
  }, []);

  return {
    listNft,
    reset,
    ...state,
    isWritePending,
    isConfirming,
    isApprovalProcessing,
    // Convenience computed properties
    canList:
      isConnected &&
      isSupportedChain(chainId) &&
      !state.isLoading &&
      !state.isPending &&
      !state.isApproving,
    isProcessing:
      state.isLoading ||
      state.isPending ||
      isWritePending ||
      isConfirming ||
      state.isApproving ||
      isApprovalProcessing,
  };
}
