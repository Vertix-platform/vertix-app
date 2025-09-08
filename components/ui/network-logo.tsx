import React from 'react';
import Image from 'next/image';
import { networks } from '@/lib/networks';

interface NetworkLogoProps {
  chainId: number;
  size?: number;
  className?: string;
}

export const NetworkLogo: React.FC<NetworkLogoProps> = ({
  chainId,
  size = 24,
  className = '',
}) => {
  const network = networks.find(n => n.chain.id === chainId);

  if (!network?.icon) {
    return (
      <div
        className={`bg-gray-400 rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className='text-white text-xs font-bold'>{chainId}</span>
      </div>
    );
  }

  return (
    <Image
      src={network.icon}
      alt={network.chain.name}
      width={size}
      height={size}
      className={className}
    />
  );
};
