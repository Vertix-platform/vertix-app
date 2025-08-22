'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { PRIVY_CONFIG } from '@/lib/config';
import { useAuthStore } from '@/store/auth-store';
import { useEffect } from 'react';

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { checkAuth } = useAuthStore();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <PrivyProvider
      key="privy-provider"
      appId={PRIVY_CONFIG.appId}
      clientId={PRIVY_CONFIG.clientId}
      config={PRIVY_CONFIG.config}
    >
      {children}
    </PrivyProvider>
  );
};
