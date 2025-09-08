'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useChainId } from 'wagmi';
import { networks } from '@/lib/networks';
import type { Network } from '@/types/network';

type NetworkContextType = {
  selectedNetwork: Network;
  isSupported: boolean;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const chainId = useChainId();
  const [selectedNetwork, setSelectedNetwork] = useState<Network>(networks[0]);

  useEffect(() => {
    if (chainId) {
      const network = networks.find(n => n.chain.id === chainId);
      if (network) {
        setSelectedNetwork(network);
      }
    }
  }, [chainId]);

  const isSupported = chainId
    ? networks.some(n => n.chain.id === chainId)
    : false;

  const value: NetworkContextType = {
    selectedNetwork,
    isSupported,
  };

  return (
    <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
  );
}

export const useNetworkContext = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetworkContext must be used within a NetworkProvider');
  }
  return context;
};
