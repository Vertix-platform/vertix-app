import type { Network } from '@/types/network';
import Polygon from '@/assets/svg/polygon.svg';
import Base from '@/assets/png/base.jpeg';
import Ethereum from '@/assets/svg/ethereum.svg';

export const networks: Network[] = [
  {
    chain: {
      id: 1,
      name: 'Ethereum',
      network: 'ethereum',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://eth-mainnet.g.alchemy.com/v2/your-api-key'],
        },
        public: {
          http: ['https://eth.llamarpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Etherscan',
          url: 'https://etherscan.io',
        },
      },
    },
    icon: Ethereum,
    color: '#3C3C3D',
  },
  {
    chain: {
      id: 1101,
      name: 'Polygon zkEVM',
      network: 'polygon-zkevm',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://zkevm-rpc.com'],
        },
        public: {
          http: ['https://zkevm-rpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'PolygonScan',
          url: 'https://zkevm.polygonscan.com',
        },
      },
    },
    icon: Polygon,
    color: '#8247E5',
  },
  {
    chain: {
      id: 8453,
      name: 'Base',
      network: 'base',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://mainnet.base.org'],
        },
        public: {
          http: ['https://mainnet.base.org'],
        },
      },
      blockExplorers: {
        default: {
          name: 'BaseScan',
          url: 'https://basescan.org',
        },
      },
    },
    icon: Base,
    color: '#0052FF',
  },
  {
    chain: {
      id: 2442,
      name: 'Cardona zkEVM',
      network: 'cardona-zkevm',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://rpc.cardona.zkevm-rpc.com'],
        },
        public: {
          http: ['https://rpc.cardona.zkevm-rpc.com'],
        },
      },
      blockExplorers: {
        default: {
          name: 'PolygonScan',
          url: 'https://cardona-zkevm.polygonscan.com/',
        },
      },
    },
    icon: Polygon,
    color: '#8247E5',
  },
  {
    chain: {
      id: 84532,
      name: 'Base Sepolia',
      network: 'base-sepolia',
      nativeCurrency: {
        name: 'Ether',
        symbol: 'ETH',
        decimals: 18,
      },
      rpcUrls: {
        default: {
          http: ['https://sepolia.base.org'],
        },
        public: {
          http: ['https://sepolia.base.org'],
        },
      },
      blockExplorers: {
        default: {
          name: 'Base Sepolia Explorer',
          url: 'https://sepolia.basescan.org',
        },
      },
    },
    icon: Base,
    color: '#0052FF',
  },
];

export const getNetworkByChainId = (chainId: number): Network | undefined => {
  return networks.find(network => network.chain.id === chainId);
};

export const getNetworkByName = (name: string): Network | undefined => {
  return networks.find(network => network.chain.name === name);
};
