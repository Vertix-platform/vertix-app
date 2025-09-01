import { PinataSDK } from "pinata"

export interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{ trait_type: string; value: string }>
  external_url?: string
  animation_url?: string
}

export interface UploadedData {
  imageUri: string
  metadataUri: string
  metadataHash: string
}

export interface IPFSConfig {
  pinataJwt: string
  pinataGateway: string
}

/**
 * Initialize Pinata SDK with configuration
 */
const createPinataInstance = (config: IPFSConfig): PinataSDK => {
  if (!config.pinataJwt || !config.pinataGateway) {
    throw new Error('Pinata configuration not found. Please set up your environment variables.')
  }

  return new PinataSDK({
    pinataJwt: config.pinataJwt,
    pinataGateway: config.pinataGateway,
  })
}

/**
 * Upload a file to IPFS using Pinata
 */
export const uploadFileToIPFS = async (file: File, config?: IPFSConfig): Promise<string> => {
  try {
    const pinataConfig = config || {
      pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
      pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
    }

    const pinata = createPinataInstance(pinataConfig)
    const upload = await pinata.upload.public.file(file)
    return upload.cid
  } catch (error) {
    console.error('Pinata upload error:', error)
    if (error instanceof Error && error.message.includes('Pinata configuration')) {
      throw error
    }
    throw new Error('Failed to upload file to IPFS. Please check your Pinata configuration.')
  }
}

/**
 * Generate NFT metadata object
 */
export const generateNFTMetadata = (
  name: string,
  description: string,
  imageUri: string,
  attributes: Array<{ trait_type: string; value: string }> = [],
  externalUrl?: string,
  animationUrl?: string
): NFTMetadata => {
  return {
    name,
    description,
    image: imageUri,
    attributes: attributes.filter(attr => attr.trait_type && attr.value),
    external_url: externalUrl || "https://vertix.market",
    animation_url: animationUrl || "",
  }
}

/**
 * Upload metadata to IPFS
 */
export const uploadMetadataToIPFS = async (
  metadata: NFTMetadata,
  config?: IPFSConfig
): Promise<string> => {
  try {
    const pinataConfig = config || {
      pinataJwt: process.env.NEXT_PUBLIC_PINATA_JWT!,
      pinataGateway: process.env.NEXT_PUBLIC_PINATA_GATEWAY!,
    }

    const pinata = createPinataInstance(pinataConfig)

    // Create a JSON file from metadata
    const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
      type: 'application/json',
    })
    const metadataFile = new File([metadataBlob], 'metadata.json', {
      type: 'application/json',
    })

    const upload = await pinata.upload.public.file(metadataFile)
    return upload.cid
  } catch (error) {
    console.error('Pinata metadata upload error:', error)
    if (error instanceof Error && error.message.includes('Pinata configuration')) {
      throw error
    }
    throw new Error('Failed to upload metadata to IPFS. Please check your Pinata configuration.')
  }
}

/**
 * Generate SHA-256 hash of metadata
 */
export const generateMetadataHash = async (metadata: NFTMetadata): Promise<string> => {
  try {
    // Use Web Crypto API to generate SHA-256 hash
    const encoder = new TextEncoder()
    const data = encoder.encode(JSON.stringify(metadata))
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
    return `0x${hashHex}`
  } catch (error) {
    // Fallback: simple hash generation
    const metadataString = JSON.stringify(metadata)
    let hash = 0
    for (let i = 0; i < metadataString.length; i++) {
      const char = metadataString.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return `0x${Math.abs(hash).toString(16).padStart(64, '0')}`
  }
}

/**
 * Complete NFT upload process: upload image, generate metadata, upload metadata, generate hash
 */
export const uploadNFTToIPFS = async (
  file: File,
  name: string,
  description: string,
  attributes: Array<{ trait_type: string; value: string }> = [],
  externalUrl?: string,
  animationUrl?: string,
  config?: IPFSConfig
): Promise<UploadedData> => {
  // Step 1: Upload image to IPFS
  const imageCid = await uploadFileToIPFS(file, config)
  const imageUri = `ipfs://${imageCid}`
  
  // Step 2: Generate metadata
  const metadata = generateNFTMetadata(name, description, imageUri, attributes, externalUrl, animationUrl)
  
  // Step 3: Upload metadata to IPFS
  const metadataCid = await uploadMetadataToIPFS(metadata, config)
  const metadataUri = `ipfs://${metadataCid}`
  
  // Step 4: Generate metadata hash
  const metadataHash = await generateMetadataHash(metadata)

  return {
    imageUri,
    metadataUri,
    metadataHash,
  }
}

/**
 * Validate file for IPFS upload
 */
export const validateFileForIPFS = (file: File): { isValid: boolean; error?: string } => {
  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { isValid: false, error: 'Please select a valid image file' }
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    return { isValid: false, error: 'Image file size must be less than 10MB' }
  }

  return { isValid: true }
}

/**
 * Get IPFS gateway URL from CID
 */
export const getIPFSGatewayUrl = (cid: string, gateway?: string): string => {
  const gatewayDomain = gateway || process.env.NEXT_PUBLIC_PINATA_GATEWAY || 'gateway.pinata.cloud'
  return `https://${gatewayDomain}/ipfs/${cid}`
}

/**
 * Convert IPFS URI to gateway URL
 */
export const ipfsUriToGatewayUrl = (ipfsUri: string, gateway?: string): string => {
  if (!ipfsUri.startsWith('ipfs://')) {
    throw new Error('Invalid IPFS URI format')
  }
  const cid = ipfsUri.replace('ipfs://', '')
  return getIPFSGatewayUrl(cid, gateway)
}
