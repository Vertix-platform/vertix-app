import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthStore, UserResponse, PrivyUser } from '@/types/auth';
import { apiClient } from '@/lib/api';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial State
      user: null,
      privyUser: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      accessToken: null,
      refreshToken: null,

      // Actions
      login: (userData: UserResponse, tokens: { access_token: string; refresh_token: string }) => {
        set({
          user: userData,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          isAuthenticated: true,
          error: null,
        });
      },

      logout: () => {
        apiClient.logout();
        set({
          user: null,
          privyUser: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          error: null,
        });
      },

      setPrivyUser: (privyUser: PrivyUser | null) => {
        set({ privyUser });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      clearError: () => {
        set({ error: null });
      },

      setTokens: (accessToken: string, refreshToken: string) => {
        set({ accessToken, refreshToken });
      },

      checkAuth: async () => {
        if (!apiClient.isAuthenticated()) {
          return false;
        }

        try {
          set({ isLoading: true });
          const response = await apiClient.getUserProfile();
          if (response.success && response.data) {
            set({
              user: response.data,
              isAuthenticated: true,
              error: null,
            });
            return true;
          } else {
            apiClient.logout();
            set({
              user: null,
              privyUser: null,
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              error: null,
            });
            return false;
          }
        } catch (err) {
          apiClient.logout();
          set({
            user: null,
            privyUser: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: null,
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      refreshAccessToken: async () => {
        const refreshToken = apiClient.getRefreshToken();
        if (!refreshToken) {
          return false;
        }

        try {
          set({ isLoading: true });
          const response = await apiClient.refreshToken(refreshToken);
          if (response.success && response.data) {
            set({
              accessToken: response.data.access_token,
              refreshToken: response.data.refresh_token,
              error: null,
            });
            return true;
          } else {
            // Refresh failed, logout
            apiClient.logout();
            set({
              user: null,
              privyUser: null,
              isAuthenticated: false,
              accessToken: null,
              refreshToken: null,
              error: null,
            });
            return false;
          }
        } catch (err) {
          apiClient.logout();
          set({
            user: null,
            privyUser: null,
            isAuthenticated: false,
            accessToken: null,
            refreshToken: null,
            error: null,
          });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
