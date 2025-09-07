'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId } from 'wagmi'
import { type Hash } from 'viem'
import { getContractAddress, isSupportedChain } from '@/lib/contracts/addresses'
import { VERTIX_NFT_ABI } from '@/lib/contracts/abis/vertix-nft'
import { toast } from 'react-hot-toast'
import { keccak256, toBytes } from 'viem'

export interface MintNftToCollectionParams {
  to: string // recipient address
  collectionId: number // collection ID to mint to
  uri: string // IPFS metadata URI
  metadataHash: string // metadata hash
  royaltyBps: number // royalty basis points (0-1000)
}

export interface MintNftToCollectionState {
  isLoading: boolean
  isPending: boolean
  isSuccess: boolean
  error: string | null
  transactionHash?: Hash
  tokenId?: bigint
}

export function useMintNftToCollection() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const { writeContract, isPending: isWritePending, data: txHash } = useWriteContract()

  const [state, setState] = useState<MintNftToCollectionState>({
    isLoading: false,
    isPending: false,
    isSuccess: false,
    error: null,
  })

  const [pendingTxHash, setPendingTxHash] = useState<Hash>()
  const processedTxHash = useRef<Hash | undefined>(undefined)

  // Watch for transaction hash from writeContract
  useEffect(() => {
    if (txHash && txHash !== processedTxHash.current) {
      processedTxHash.current = txHash
      setPendingTxHash(txHash)
      setState(prev => ({
        ...prev,
        transactionHash: txHash,
        isPending: true,
        isLoading: false
      }))
    }
  }, [txHash])

  // Wait for transaction confirmation
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError
  } = useWaitForTransactionReceipt({
    hash: pendingTxHash,
  })

  const mintToCollection = useCallback(
    async (params: MintNftToCollectionParams): Promise<{ success: boolean; tokenId?: bigint; transactionHash?: Hash }> => {
      try {
        // Validation
        if (!isConnected || !address) {
          const errorMsg = 'Please connect your wallet first'
          setState(prev => ({ ...prev, error: errorMsg }))
          toast.error(errorMsg)
          return { success: false }
        }

        if (!isSupportedChain(chainId)) {
          const errorMsg = `Unsupported chain. Please switch to a supported network.`
          setState(prev => ({ ...prev, error: errorMsg }))
          toast.error(errorMsg)
          return { success: false }
        }

        if (!params.to || !params.uri || !params.metadataHash) {
          const errorMsg = 'All NFT parameters are required'
          setState(prev => ({ ...prev, error: errorMsg }))
          toast.error(errorMsg)
          return { success: false }
        }

        if (params.collectionId <= 0) {
          const errorMsg = 'Valid collection ID is required'
          setState(prev => ({ ...prev, error: errorMsg }))
          toast.error(errorMsg)
          return { success: false }
        }

        if (params.royaltyBps < 0 || params.royaltyBps > 1000) {
          const errorMsg = 'Royalty must be between 0 and 1000 basis points (0-10%)'
          setState(prev => ({ ...prev, error: errorMsg }))
          toast.error(errorMsg)
          return { success: false }
        }

        setState(prev => ({
          ...prev,
          isLoading: true,
          isPending: true,
          error: null,
          isSuccess: false
        }))

        // Get contract address for current chain
        const contractAddress = getContractAddress(chainId, 'VertixNFT')

        console.log('Minting NFT to collection with params:', {
          chainId,
          contractAddress,
          params,
          address
        })

        // Convert metadata hash to bytes32
        const metadataHashBytes = keccak256(toBytes(params.metadataHash))

        // Call smart contract
        writeContract({
          address: contractAddress,
          abi: VERTIX_NFT_ABI,
          functionName: 'mintToCollection',
          args: [
            params.to as `0x${string}`,
            BigInt(params.collectionId),
            params.uri,
            metadataHashBytes,
            BigInt(params.royaltyBps)
          ],
        })

        setState(prev => ({
          ...prev,
          isPending: true,
          isLoading: false
        }))

        toast.loading('Minting NFT to collection...', { id: 'mint-nft-to-collection' })

        return { success: true }

      } catch (error) {
        console.error('Mint NFT to collection error:', error)

        let errorMessage = 'Failed to mint NFT to collection'

        if (error instanceof Error) {
          if (error.message.includes('User rejected')) {
            errorMessage = 'Transaction cancelled by user'
          } else if (error.message.includes('insufficient funds')) {
            errorMessage = 'Insufficient funds for gas fees'
          } else if (error.message.includes('VertixNFT__InvalidRoyalty')) {
            errorMessage = 'Invalid royalty percentage'
          } else if (error.message.includes('VertixNFT__InvalidRecipient')) {
            errorMessage = 'Invalid recipient address'
          } else if (error.message.includes('VertixNFT__CollectionNotFound')) {
            errorMessage = 'Collection not found'
          } else if (error.message.includes('VertixNFT__CollectionMaxSupplyReached')) {
            errorMessage = 'Collection has reached maximum supply'
          } else {
            errorMessage = error.message
          }
        }

        setState(prev => ({
          ...prev,
          isLoading: false,
          isPending: false,
          error: errorMessage
        }))

        toast.error(errorMessage, { id: 'mint-nft-to-collection' })
        return { success: false }
      }
    },
    [isConnected, address, chainId, writeContract]
  )

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        isSuccess: true,
        error: null
      }))
      setPendingTxHash(undefined)
    }
  }, [isConfirmed, pendingTxHash])

  // Handle confirmation error
  useEffect(() => {
    if (confirmError && pendingTxHash) {
      const errorMsg = 'Transaction failed to confirm'
      setState(prev => ({
        ...prev,
        isPending: false,
        isLoading: false,
        error: errorMsg
      }))
      setPendingTxHash(undefined)
    }
  }, [confirmError, pendingTxHash])

  // Show success toast when transaction is confirmed
  useEffect(() => {
    if (isConfirmed && pendingTxHash) {
      toast.success('NFT minted to collection successfully!', { id: 'mint-nft-to-collection' })
    }
  }, [isConfirmed, pendingTxHash])

  // Show error toast when confirmation fails
  useEffect(() => {
    if (confirmError && pendingTxHash) {
      const errorMsg = 'Transaction failed to confirm'
      toast.error(errorMsg, { id: 'mint-nft-to-collection' })
    }
  }, [confirmError, pendingTxHash])

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      isPending: false,
      isSuccess: false,
      error: null,
    })
    setPendingTxHash(undefined)
    processedTxHash.current = undefined
  }, [])

  return {
    mintToCollection,
    reset,
    ...state,
    isWritePending,
    isConfirming,
    // Convenience computed properties
    canMint: isConnected && isSupportedChain(chainId) && !state.isLoading && !state.isPending,
    isProcessing: state.isLoading || state.isPending || isWritePending || isConfirming,
  }
}
