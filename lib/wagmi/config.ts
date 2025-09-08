'use client';

import { createConfig } from '@privy-io/wagmi';
import {
  base,
  baseSepolia,
  polygon,
  polygonZkEvm,
  polygonZkEvmCardona,
  mainnet,
} from 'wagmi/chains';
import { http } from 'viem';

// Supported chains for the application
export const supportedChains = [
  baseSepolia, // Primary testnet
  base,
  mainnet, // Ethereum mainnet
  polygon,
  polygonZkEvm,
  polygonZkEvmCardona,
] as const;

// Create Wagmi configuration - Privy handles connectors internally
export const wagmiConfig = createConfig({
  chains: supportedChains,
  transports: {
    [baseSepolia.id]: http(),
    [base.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [polygonZkEvm.id]: http(),
    [polygonZkEvmCardona.id]: http(),
  },
  ssr: true, // Enable server-side rendering support
});
