import { useCallback, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAuthStore } from '@/store/auth-store';
import { apiClient } from '@/lib/api';
import type {
  RegisterRequest,
  LoginRequest,
  ConnectWalletRequest,
  PrivyUser,
  ApiResponse,
  UserResponse,
} from '@/types/auth';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
  const {
    login,
    logout,
    setPrivyUser,
    setLoading,
    setError,
    clearError,
    user,
    privyUser,
    isAuthenticated,
    isLoading,
    error,
    checkAuth,
    refreshAccessToken,
  } = useAuthStore();

  const {
    authenticated,
    user: privyUserData,
    login: privyLogin,
    logout: privyLogout,
    ready,
    signMessage,
  } = usePrivy();

  const router = useRouter();

  // Sync Privy user with our store
  useEffect(() => {
    if (ready && privyUserData) {
      setPrivyUser(privyUserData as unknown as PrivyUser);
    } else if (ready && !privyUserData) {
      setPrivyUser(null);
    }
  }, [ready, privyUserData, setPrivyUser]);

  // Handle wallet connection
  const connectWallet = useCallback(
    async (walletAddress: string) => {
      try {
        setLoading(true);
        clearError();

        // Get nonce from backend
        const nonceResponse = await apiClient.getNonce({
          wallet_address: walletAddress,
        });
        if (!nonceResponse.success || !nonceResponse.data) {
          throw new Error(nonceResponse.error || 'Failed to get nonce');
        }

        // Sign message with wallet using Privy
        const message = `Connect to Vertix: ${nonceResponse.data.nonce}`;
        const signatureResponse = await signMessage({ message });

        if (!signatureResponse?.signature) {
          throw new Error('Failed to sign message with wallet');
        }

        const connectRequest: ConnectWalletRequest = {
          wallet_address: walletAddress,
          signature: signatureResponse.signature,
          nonce: nonceResponse.data.nonce,
        };

        const response: ApiResponse<UserResponse> =
          await apiClient.connectWallet(connectRequest);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Failed to connect wallet');
        }

        // For wallet connection, we don't get tokens, so we just update the user
        // The user will need to login separately to get tokens
        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Wallet connection failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [signMessage, setLoading, setError, clearError]
  );

  // Traditional email/password registration
  const register = useCallback(
    async (data: RegisterRequest) => {
      try {
        setLoading(true);
        clearError();

        const response = await apiClient.register(data);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Registration failed');
        }

        // Get user profile after successful registration
        const profileResponse = await apiClient.getUserProfile();
        if (profileResponse.success && profileResponse.data) {
          login(profileResponse.data, {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
          });
        }

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Registration failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login, setLoading, setError, clearError]
  );

  // Traditional email/password login
  const loginWithEmail = useCallback(
    async (data: LoginRequest) => {
      try {
        setLoading(true);
        clearError();

        const response = await apiClient.login(data);
        if (!response.success || !response.data) {
          // Handle specific error cases with better UX
          if (response.error?.includes('Too many active sessions')) {
            console.log(
              'You have too many active sessions. Please log out from other devices or contact support to reset your sessions.'
            );
          }
          console.log(
            response.error ||
              'Login failed. Please check your credentials and try again.'
          );
        }

        // Get user profile after successful login
        const profileResponse = await apiClient.getUserProfile();
        if (profileResponse.success && profileResponse.data) {
          login(profileResponse.data, {
            access_token: response.data?.access_token || '',
            refresh_token: response.data?.refresh_token || '',
          });
        }

        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError(
          err instanceof Error ? err.message : 'An unexpected error occurred'
        );
        throw err;
      }
    },
    [login, setLoading, setError, clearError]
  );

  // Google OAuth login
  const loginWithGoogle = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      console.log('Starting Google OAuth flow...');

      // Get Google auth URL from backend
      const authUrlResponse = await apiClient.getGoogleAuthUrl();
      console.log('Google auth URL response:', authUrlResponse);

      if (!authUrlResponse.success || !authUrlResponse.data) {
        if (authUrlResponse.error?.includes('GOOGLE_CLIENT_ID must be set')) {
          throw new Error(
            'Google OAuth is not configured. Please set up Google OAuth credentials in the backend.'
          );
        }
        throw new Error(
          authUrlResponse.error || 'Failed to get Google auth URL'
        );
      }

      // Redirect to Google OAuth
      router.push(authUrlResponse.data.auth_url);
    } catch (err) {
      console.error('Google OAuth error:', err);
      const errorMessage =
        err instanceof Error ? err.message : 'Google OAuth failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, clearError]);

  // Handle Google OAuth callback
  const handleGoogleCallback = useCallback(
    async (code: string, state: string) => {
      try {
        setLoading(true);
        clearError();

        const response = await apiClient.googleCallback(code, state);
        if (!response.success || !response.data) {
          throw new Error(response.error || 'Google OAuth callback failed');
        }

        // Get user profile after successful OAuth
        const profileResponse = await apiClient.getUserProfile();
        if (profileResponse.success && profileResponse.data) {
          login(profileResponse.data, {
            access_token: response.data.access_token,
            refresh_token: response.data.refresh_token,
          });
        }

        return response.data;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Google OAuth callback failed';
        setError(errorMessage);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [login, setLoading, setError, clearError]
  );

  // Handle logout
  const handleLogout = useCallback(() => {
    logout();
    privyLogout();
  }, [logout, privyLogout]);

  // Handle wallet disconnection
  const disconnectWallet = useCallback(async () => {
    try {
      setLoading(true);
      clearError();

      // Clear wallet data from backend (if needed)
      // For now, we'll just clear the local state
      // You can add a backend call here if needed to update user's wallet status

      // Clear Privy wallet connection
      await privyLogout();

      // Clear local wallet data
      // This assumes you have a way to clear wallet data from the store
      // You might need to add this to your auth store
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Wallet disconnection failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [privyLogout, setLoading, setError, clearError]);

  return {
    // State
    user,
    privyUser,
    isAuthenticated,
    isLoading,
    error,
    authenticated,
    ready,

    // Actions
    register,
    loginWithEmail,
    loginWithGoogle,
    handleGoogleCallback,
    connectWallet,
    disconnectWallet,
    logout: handleLogout,
    loginWithPrivy: privyLogin,
    clearError,
    checkAuth,
    refreshAccessToken,

    // Privy methods
    privyLogin,
    privyLogout,
    signMessage,
  };
};
