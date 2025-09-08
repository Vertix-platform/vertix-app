import React from 'react';
import { Navbar } from '@/components/layout/navbar';
import { PrivyProviderWrapper } from '@/components/auth/privy-provider';
import { NetworkProvider } from '@/contexts/network-context';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProviderWrapper>
      <NetworkProvider>
        <div className='w-full h-full'>
          <Navbar key={'vertix-marketplace-navbar'} />
          {children}
        </div>
      </NetworkProvider>
    </PrivyProviderWrapper>
  );
}
