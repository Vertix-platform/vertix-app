'use client';

import React, { createContext, useState, useContext, useEffect } from 'react';
import { networks } from '@/lib/networks';
import type { Network } from '@/types/network';
import { usePrivy } from '@privy-io/react-auth';

type NetworkContextType = {
  selectedNetwork: Network;
  setSelectedNetwork: (network: Network) => void;
  switchNetwork: (network: Network) => Promise<boolean>;
  isSwitching: boolean;
};

const STORAGE_KEY = 'vertix-selectedNetwork';

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

const getStoredNetwork = (): Network => {
  if (typeof window === 'undefined') return networks[0];
  
  const storedNetworkName = localStorage.getItem(STORAGE_KEY);
  if (storedNetworkName) {
    const network = networks.find((n) => n.chain.name === storedNetworkName);
    if (network) return network;
  }
  return networks[0];
};

const setStoredNetwork = (network: Network) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, network.chain.name);
};

const switchNetworkInWallet = async (network: Network): Promise<boolean> => {
  if (typeof window.ethereum !== 'undefined') {
    try {
      await (window.ethereum as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${network.chain.id.toString(16)}` }],
      });
      return true;
    } catch (error: any) {
      // If the network is not added to the wallet, try to add it
      if (error.code === 4902) {
        try {
          await (window.ethereum as any).request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${network.chain.id.toString(16)}`,
                chainName: network.chain.name,
                nativeCurrency: network.chain.nativeCurrency,
                rpcUrls: network.chain.rpcUrls.default.http,
                blockExplorerUrls: network.chain.blockExplorers 
                  ? [network.chain.blockExplorers.default.url] 
                  : undefined,
              },
            ],
          });
          return true;
        } catch (addError) {
          console.error('Failed to add network:', addError);
          return false;
        }
      }
      console.error('Failed to switch network:', error);
      return false;
    }
  }
  return false;
};

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [selectedNetwork, setSelectedNetworkState] = useState<Network>(networks[0]);
  const [isSwitching, setIsSwitching] = useState(false);
  const { authenticated, user: privyUser } = usePrivy();

  const switchNetwork = async (network: Network): Promise<boolean> => {
    setIsSwitching(true);
    try {
      // If user has a connected wallet, try to switch in the wallet
      if (authenticated && privyUser?.wallet?.address) {
        const switched = await switchNetworkInWallet(network);
        if (switched) {
          setSelectedNetworkState(network);
          setStoredNetwork(network);
          return true;
        }
        return false;
      } else {
        // If no wallet connected, just update the local state
        setSelectedNetworkState(network);
        setStoredNetwork(network);
        return true;
      }
    } catch (error) {
      console.error('Network switch error:', error);
      return false;
    } finally {
      setIsSwitching(false);
    }
  };

  const handleNetworkChange = async (network: Network) => {
    await switchNetwork(network);
  };

  useEffect(() => {
    const initNetwork = async () => {
      const preferredNetwork = getStoredNetwork();
      await handleNetworkChange(preferredNetwork);
    };

    initNetwork();
  }, []);

  // Cross-tab synchronization
  useEffect(() => {
    const onStorageUpdate = () => {
      const storedNetwork = getStoredNetwork();
      handleNetworkChange(storedNetwork);
    };

    window.addEventListener('storage', onStorageUpdate);
    return () => {
      window.removeEventListener('storage', onStorageUpdate);
    };
  }, []);

  return (
    <NetworkContext.Provider
      value={{ 
        selectedNetwork, 
        setSelectedNetwork: handleNetworkChange,
        switchNetwork,
        isSwitching
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};
