import { useAccount, useChainId } from 'wagmi';
import { networks } from '@/lib/networks';
import type { Network } from '@/types/network';

export const useNetworkInfo = () => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  
  const currentNetwork = chainId ? networks.find(network => network.chain.id === chainId) : null;
  const isSupported = chainId ? networks.some(n => n.chain.id === chainId) : false;
  
  return {
    chainId,
    isConnected,
    currentNetwork,
    isSupported,
    networks,
  };
};

