'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_CONFIG } from '@/lib/config';

interface PrivyProviderWrapperProps {
  children: React.ReactNode;
}

export const PrivyProviderWrapper: React.FC<PrivyProviderWrapperProps> = ({ children }) => {
  return (
    <PrivyProvider
      appId={PRIVY_CONFIG.appId}
      clientId={PRIVY_CONFIG.clientId}
      config={PRIVY_CONFIG.config}
    >
      {children}
    </PrivyProvider>
  );
};
