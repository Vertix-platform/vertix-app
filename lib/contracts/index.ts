// Export all contract ABIs and addresses
export { MARKETPLACE_PROXY_ABI } from './abis/marketplace-proxy';
export { VERTIX_NFT_ABI } from './abis/vertix-nft';

// Import JSON ABIs
import marketplaceCoreAbi from './abis/MarketplaceCore.json';
import vertixGovernanceAbi from './abis/VertixGovernance.json';
import vertixNftAbi from './abis/VertixNFT.json';

export const MARKETPLACE_CORE_ABI = marketplaceCoreAbi;
export const VERTIX_GOVERNANCE_ABI = vertixGovernanceAbi;
export const VERTIX_NFT_ABI_JSON = vertixNftAbi;

// Export addresses
export * from './addresses';
