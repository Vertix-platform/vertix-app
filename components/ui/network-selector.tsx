'use client';

import React from 'react';
import { useAccount, useChainId, useSwitchChain } from 'wagmi';
import { networks } from '@/lib/networks';
import { Button } from '@/components/ui/button';
import { NetworkLogo } from '@/components/ui/network-logo';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { RiCheckFill } from '@remixicon/react';
import type { Network } from '@/types/network';

interface NetworkSelectorProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  variant = 'outline',
  size = 'sm',
  className = '',
}) => {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  const currentNetwork = networks.find(network => network.chain.id === chainId) || networks[0];

  const handleNetworkSwitch = async (network: Network) => {
    if (network.chain.id === chainId) return;

    try {
      if (switchChain && isConnected) {
        switchChain({ chainId: network.chain.id });
        toast.success(`Switching to ${network.chain.name}...`);
      } else {
        toast.error('Wallet not connected');
      }
    } catch (error) {
      toast.error(`Failed to switch to ${network.chain.name}`);
      console.error('Network switch error:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`flex items-center gap-2 ${className}`}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <NetworkLogo 
              chainId={currentNetwork.chain.id} 
              size={20} 
              className="w-5 h-5" 
            />
          )}
          <span className="hidden sm:inline">
            {currentNetwork.chain.name}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.chain.id}
            onClick={() => handleNetworkSwitch(network)}
            disabled={network.chain.id === chainId || isPending}
            className={`flex items-center gap-3 ${
              network.chain.id === chainId
                ? 'bg-gray-800 !text-white'
                : ''
            }`}
          >
            <NetworkLogo 
              chainId={network.chain.id} 
              size={20} 
              className="w-5 h-5" 
            />
            <div className="">
              <span className="font-medium text-white">{network.chain.name}</span>
            </div>
            {network.chain.id === chainId && (
              <RiCheckFill className="ml-auto text-xs text-white" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
