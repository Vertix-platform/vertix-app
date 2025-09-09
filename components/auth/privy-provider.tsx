'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_CONFIG } from '@/lib/config';
import { QueryClient } from '@tanstack/react-query';
import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { WagmiProvider } from '@privy-io/wagmi';
import { wagmiConfig } from '@/lib/wagmi/config';

interface PrivyProviderWrapperProps {
  children: React.ReactNode;
}

export const PrivyProviderWrapper: React.FC<PrivyProviderWrapperProps> = ({
  children,
}) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            retry: false,
          },
        },
      })
  );
  return (
    <PrivyProvider
      key={'vertix-privy-provider'}
      appId={PRIVY_CONFIG.appId}
      clientId={PRIVY_CONFIG.clientId}
      config={PRIVY_CONFIG.config}
    >
      <QueryClientProvider client={queryClient}>
        <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
};
