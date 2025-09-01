'use client';

import React from 'react';
import { useNetwork } from '@/contexts/network-context';
import { networks } from '@/lib/networks';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { RiCheckFill } from '@remixicon/react';
import Image from 'next/image';
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
  const { selectedNetwork, switchNetwork, isSwitching } = useNetwork();

  const handleNetworkSwitch = async (network: Network) => {
    if (network.chain.id === selectedNetwork.chain.id) return;

    try {
      const success = await switchNetwork(network);
      if (success) {
        toast.success(`Switched to ${network.chain.name}`);
      } else {
        toast.error(`Failed to switch to ${network.chain.name}`);
      }
    } catch (error) {
      toast.error('Network switch failed');
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
          disabled={isSwitching}
        >
          {isSwitching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Image
              src={selectedNetwork.icon!}
              alt={selectedNetwork.chain.name}
              width={20}
              height={20}
              className='w-5 h-5'
            />
          )}
          <span className="hidden sm:inline">
            {selectedNetwork.chain.name}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {networks.map((network) => (
          <DropdownMenuItem
            key={network.chain.id}
            onClick={() => handleNetworkSwitch(network)}
            disabled={network.chain.id === selectedNetwork.chain.id || isSwitching}
            className={`flex items-center gap-3 ${
              network.chain.id === selectedNetwork.chain.id
                ? 'bg-gray-800 !text-white'
                : ''
            }`}
          >
            <Image
              src={network.icon!}
              alt={network.chain.name}
              width={20}
              height={20}
              className='w-5 h-5'
            />
            <div className="">
              <span className="font-medium text-white">{network.chain.name}</span>
            </div>
            {network.chain.id === selectedNetwork.chain.id && (
              <RiCheckFill className="ml-auto text-xs text-white" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
