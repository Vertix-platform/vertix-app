import { type Address } from 'viem'
import { base, baseSepolia, polygon, polygonZkEvm, polygonZkEvmCardona } from 'viem/chains'

export type ChainId = typeof baseSepolia.id | typeof base.id | typeof polygon.id | typeof polygonZkEvm.id | typeof polygonZkEvmCardona.id

export interface ContractAddresses {
  VertixNFT: Address
  MarketplaceCore: Address
  MarketplaceProxy: Address
  VertixEscrow: Address
  VertixGovernance: Address
  CrossChainBridge: Address
  CrossChainRegistry: Address
  MarketplaceStorage: Address
  MarketplaceFees: Address
  MarketplaceAuctions: Address
  VerificationServer: Address
  FeeRecipient: Address
}

// Contract addresses for each supported chain
export const CONTRACT_ADDRESSES: Record<ChainId, ContractAddresses> = {
  // Base Sepolia (Testnet) - Primary development network
  [baseSepolia.id]: {
    VertixNFT: '0xF99C6514473BA9Ef1c930837E1ff4eaC19d2537B',
    MarketplaceCore: '0x4ca7F087ED4ac44aB2F9754E18cb8a8a36f075c6',
    MarketplaceProxy: '0xE0C75458196CC9f3103cd71D0522c1b37ff3D3a4',
    VertixEscrow: '0x631741753226DE2c349629388d1358C01049fa4D',
    VertixGovernance: '0x8a8B5EaeF9Bfe6091Da0aee2d157E18A6F726d09',
    CrossChainBridge: '0xF527bFb7827b072F1c5273cfEc6E21C6E3c3eD1e',
    CrossChainRegistry: '0x90489C9227FB79978df4a5cc71A036d59e120110',
    MarketplaceStorage: '0x3E5BCad49413B6B877F97706ad4BA244BC479848',
    MarketplaceFees: '0xDA9d2C8DCd4e73d6401dd5cB1d7F6F953aA3B119',
    MarketplaceAuctions: '0x15053f4bf121a516C5454D9A69638B281907Fe71',
    VerificationServer: '0xe9f1406E039d5c3FBF442C2542Df84E52A51d3C4',
    FeeRecipient: '0xe9f1406E039d5c3FBF442C2542Df84E52A51d3C4',
  },
  // Base Mainnet
  [base.id]: {
    VertixNFT: '0x0000000000000000000000000000000000000000',
    MarketplaceCore: '0x0000000000000000000000000000000000000000',
    MarketplaceProxy: '0x0000000000000000000000000000000000000000',
    VertixEscrow: '0x0000000000000000000000000000000000000000',
    VertixGovernance: '0x0000000000000000000000000000000000000000',
    CrossChainBridge: '0x0000000000000000000000000000000000000000',
    CrossChainRegistry: '0x0000000000000000000000000000000000000000',
    MarketplaceStorage: '0x0000000000000000000000000000000000000000',
    MarketplaceFees: '0x0000000000000000000000000000000000000000',
    MarketplaceAuctions: '0x0000000000000000000000000000000000000000',
    VerificationServer: '0x0000000000000000000000000000000000000000',
    FeeRecipient: '0x0000000000000000000000000000000000000000',
  },
  // Polygon Mainnet
  [polygon.id]: {
    VertixNFT: '0x0000000000000000000000000000000000000000',
    MarketplaceCore: '0x0000000000000000000000000000000000000000',
    MarketplaceProxy: '0x0000000000000000000000000000000000000000',
    VertixEscrow: '0x0000000000000000000000000000000000000000',
    VertixGovernance: '0x0000000000000000000000000000000000000000',
    CrossChainBridge: '0x0000000000000000000000000000000000000000',
    CrossChainRegistry: '0x0000000000000000000000000000000000000000',
    MarketplaceStorage: '0x0000000000000000000000000000000000000000',
    MarketplaceFees: '0x0000000000000000000000000000000000000000',
    MarketplaceAuctions: '0x0000000000000000000000000000000000000000',
    VerificationServer: '0x0000000000000000000000000000000000000000',
    FeeRecipient: '0x0000000000000000000000000000000000000000',
  },
  // Polygon zkEVM Mainnet
  [polygonZkEvm.id]: {
    VertixNFT: '0x0000000000000000000000000000000000000000',
    MarketplaceCore: '0x0000000000000000000000000000000000000000',
    MarketplaceProxy: '0x0000000000000000000000000000000000000000',
    VertixEscrow: '0x0000000000000000000000000000000000000000',
    VertixGovernance: '0x0000000000000000000000000000000000000000',
    CrossChainBridge: '0x0000000000000000000000000000000000000000',
    CrossChainRegistry: '0x0000000000000000000000000000000000000000',
    MarketplaceStorage: '0x0000000000000000000000000000000000000000',
    MarketplaceFees: '0x0000000000000000000000000000000000000000',
    MarketplaceAuctions: '0x0000000000000000000000000000000000000000',
    VerificationServer: '0x0000000000000000000000000000000000000000',
    FeeRecipient: '0x0000000000000000000000000000000000000000',
  },
  // Polygon zkEVM Cardona (Testnet)
  [polygonZkEvmCardona.id]: {
    VertixNFT: '0x0000000000000000000000000000000000000000',
    MarketplaceCore: '0x0000000000000000000000000000000000000000',
    MarketplaceProxy: '0x0000000000000000000000000000000000000000',
    VertixEscrow: '0x0000000000000000000000000000000000000000',
    VertixGovernance: '0x0000000000000000000000000000000000000000',
    CrossChainBridge: '0x0000000000000000000000000000000000000000',
    CrossChainRegistry: '0x0000000000000000000000000000000000000000',
    MarketplaceStorage: '0x0000000000000000000000000000000000000000',
    MarketplaceFees: '0x0000000000000000000000000000000000000000',
    MarketplaceAuctions: '0x0000000000000000000000000000000000000000',
    VerificationServer: '0x0000000000000000000000000000000000000000',
    FeeRecipient: '0x0000000000000000000000000000000000000000',
  },
}

/**
 * Get contract addresses for a specific chain
 */
export function getContractAddresses(chainId: ChainId): ContractAddresses {
  const addresses = CONTRACT_ADDRESSES[chainId]
  if (!addresses) {
    throw new Error(`Unsupported chain ID: ${chainId}`)
  }
  return addresses
}

/**
 * Get a specific contract address for a chain
 */
export function getContractAddress(
  chainId: ChainId,
  contractName: keyof ContractAddresses
): Address {
  const addresses = getContractAddresses(chainId)
  return addresses[contractName]
}

/**
 * Check if a chain is supported
 */
export function isSupportedChain(chainId: number): chainId is ChainId {
  return chainId in CONTRACT_ADDRESSES
}

/**
 * Get all supported chain IDs
 */
export function getSupportedChainIds(): ChainId[] {
  return Object.keys(CONTRACT_ADDRESSES).map(Number) as ChainId[]
}
