import { useState, useCallback } from 'react'
import { 
  uploadNFTToIPFS, 
  uploadFileToIPFS, 
  uploadMetadataToIPFS, 
  generateNFTMetadata, 
  generateMetadataHash,
  validateFileForIPFS,
  type UploadedData,
  type NFTMetadata,
  type IPFSConfig
} from '@/lib/ipfs'

interface UseIPFSReturn {
  // State
  isUploading: boolean
  error: string | null
  
  // Actions
  uploadNFT: (
    file: File,
    name: string,
    description: string,
    attributes?: Array<{ trait_type: string; value: string }>,
    externalUrl?: string,
    animationUrl?: string,
    config?: IPFSConfig
  ) => Promise<UploadedData | null>
  
  uploadFile: (file: File, config?: IPFSConfig) => Promise<string | null>
  
  uploadMetadata: (metadata: NFTMetadata, config?: IPFSConfig) => Promise<string | null>
  
  generateMetadata: (
    name: string,
    description: string,
    imageUri: string,
    attributes?: Array<{ trait_type: string; value: string }>,
    externalUrl?: string,
    animationUrl?: string
  ) => NFTMetadata
  
  generateHash: (metadata: NFTMetadata) => Promise<string | null>
  
  validateFile: (file: File) => { isValid: boolean; error?: string }
  
  clearError: () => void
}

export const useIPFS = (): UseIPFSReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const uploadNFT = useCallback(async (
    file: File,
    name: string,
    description: string,
    attributes: Array<{ trait_type: string; value: string }> = [],
    externalUrl?: string,
    animationUrl?: string,
    config?: IPFSConfig
  ): Promise<UploadedData | null> => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadNFTToIPFS(
        file,
        name,
        description,
        attributes,
        externalUrl,
        animationUrl,
        config
      )
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload NFT to IPFS'
      setError(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  const uploadFile = useCallback(async (
    file: File,
    config?: IPFSConfig
  ): Promise<string | null> => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadFileToIPFS(file, config)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload file to IPFS'
      setError(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  const uploadMetadata = useCallback(async (
    metadata: NFTMetadata,
    config?: IPFSConfig
  ): Promise<string | null> => {
    setIsUploading(true)
    setError(null)

    try {
      const result = await uploadMetadataToIPFS(metadata, config)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload metadata to IPFS'
      setError(errorMessage)
      return null
    } finally {
      setIsUploading(false)
    }
  }, [])

  const generateMetadata = useCallback((
    name: string,
    description: string,
    imageUri: string,
    attributes: Array<{ trait_type: string; value: string }> = [],
    externalUrl?: string,
    animationUrl?: string
  ): NFTMetadata => {
    return generateNFTMetadata(name, description, imageUri, attributes, externalUrl, animationUrl)
  }, [])

  const generateHash = useCallback(async (
    metadata: NFTMetadata
  ): Promise<string | null> => {
    try {
      const result = await generateMetadataHash(metadata)
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate metadata hash'
      setError(errorMessage)
      return null
    }
  }, [])

  const validateFile = useCallback((file: File): { isValid: boolean; error?: string } => {
    return validateFileForIPFS(file)
  }, [])

  return {
    isUploading,
    error,
    uploadNFT,
    uploadFile,
    uploadMetadata,
    generateMetadata,
    generateHash,
    validateFile,
    clearError,
  }
}
