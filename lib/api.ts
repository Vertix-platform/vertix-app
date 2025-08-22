import { authConfig, API_ENDPOINTS } from './config';
import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  RevokeTokenRequest,
  RevokeTokenResponse,
  ConnectWalletRequest,
  NonceRequest,
  NonceResponse,
  UserResponse,
  UpdateProfileRequest,
  ApiResponse,
} from '@/types/auth';

// Cookie utility functions
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

const setCookie = (name: string, value: string, days: number = 7): void => {
  if (typeof document === 'undefined') return;
  const expires = new Date();
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Strict;Secure`;
};

const removeCookie = (name: string): void => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

// Utility functions for token management
const getAccessToken = (): string | null => {
  return getCookie('access_token');
};

const setAccessToken = (token: string): void => {
  setCookie('access_token', token, 1); // 1 day expiry for access token
};

const removeAccessToken = (): void => {
  removeCookie('access_token');
};

const getRefreshToken = (): string | null => {
  return getCookie('refresh_token');
};

const setRefreshToken = (token: string): void => {
  setCookie('refresh_token', token, 30); // 30 days expiry for refresh token
};

const removeRefreshToken = (): void => {
  removeCookie('refresh_token');
};

// Generic request function with automatic token refresh
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const url = `${authConfig.RUST_BACKEND_URL}${endpoint}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Add auth token if available
  const token = getAccessToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    headers: defaultHeaders,
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && getRefreshToken()) {
      const refreshSuccess = await refreshTokens();
      if (refreshSuccess) {
        // Retry the original request with new token
        const newToken = getAccessToken();
        if (newToken) {
          defaultHeaders['Authorization'] = `Bearer ${newToken}`;
          const retryConfig: RequestInit = {
            headers: defaultHeaders,
            ...options,
          };
          const retryResponse = await fetch(url, retryConfig);
          const data = await retryResponse.json();

          if (!retryResponse.ok) {
            return {
              success: false,
              error: data.error || `HTTP ${retryResponse.status}: ${retryResponse.statusText}`,
            };
          }

          return {
            success: true,
            data,
          };
        }
      }
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
};

// Refresh tokens function
const refreshTokens = async (): Promise<boolean> => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${authConfig.RUST_BACKEND_URL}${API_ENDPOINTS.AUTH.REFRESH}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.ok) {
      const data: RefreshTokenResponse = await response.json();
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
      return true;
    } else {
      // Refresh failed, clear tokens
      removeAccessToken();
      removeRefreshToken();
      return false;
    }
  } catch (error) {
    removeAccessToken();
    removeRefreshToken();
    return false;
  }
};

// Auth API functions
export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await makeRequest<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    }

    return response;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await makeRequest<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    if (response.success && response.data) {
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    }

    return response;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
    const response = await makeRequest<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (response.success && response.data) {
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    }

    return response;
  },

  revokeToken: async (refreshToken: string): Promise<ApiResponse<RevokeTokenResponse>> => {
    return makeRequest<RevokeTokenResponse>(API_ENDPOINTS.AUTH.REVOKE, {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  },

  revokeAllTokens: async (): Promise<ApiResponse<RevokeTokenResponse>> => {
    return makeRequest<RevokeTokenResponse>(API_ENDPOINTS.AUTH.REVOKE_ALL, {
      method: 'DELETE',
    });
  },

  connectWallet: async (data: ConnectWalletRequest): Promise<ApiResponse<UserResponse>> => {
    return makeRequest<UserResponse>(API_ENDPOINTS.AUTH.CONNECT_WALLET, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getNonce: async (data: NonceRequest): Promise<ApiResponse<NonceResponse>> => {
    return makeRequest<NonceResponse>(API_ENDPOINTS.AUTH.NONCE, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getGoogleAuthUrl: async (): Promise<ApiResponse<{ auth_url: string }>> => {
    return makeRequest<{ auth_url: string }>(API_ENDPOINTS.AUTH.GOOGLE_AUTH, {
      method: 'GET',
    });
  },

  googleCallback: async (code: string, state: string): Promise<ApiResponse<LoginResponse>> => {
    const response = await makeRequest<LoginResponse>(`${API_ENDPOINTS.AUTH.GOOGLE_CALLBACK}?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
      method: 'GET',
    });

    if (response.success && response.data) {
      setAccessToken(response.data.access_token);
      setRefreshToken(response.data.refresh_token);
    }

    return response;
  },
};

// User API functions
export const userApi = {
  getProfile: async (): Promise<ApiResponse<UserResponse>> => {
    return makeRequest<UserResponse>(API_ENDPOINTS.USER.PROFILE);
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<ApiResponse<UserResponse>> => {
    return makeRequest<UserResponse>(API_ENDPOINTS.USER.UPDATE_PROFILE, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Utility functions
export const authUtils = {
  logout: (): void => {
    removeAccessToken();
    removeRefreshToken();
  },

  isAuthenticated: (): boolean => {
    return !!getAccessToken();
  },

  getAccessToken: (): string | null => {
    return getAccessToken();
  },

  getRefreshToken: (): string | null => {
    return getRefreshToken();
  },

  setTokens: (accessToken: string, refreshToken: string): void => {
    setAccessToken(accessToken);
    setRefreshToken(refreshToken);
  },

  refreshTokens,
};

// Legacy export for backward compatibility
export const apiClient = {
  register: authApi.register,
  login: authApi.login,
  refreshToken: authApi.refreshToken,
  revokeToken: authApi.revokeToken,
  revokeAllTokens: authApi.revokeAllTokens,
  connectWallet: authApi.connectWallet,
  getNonce: authApi.getNonce,
  getGoogleAuthUrl: authApi.getGoogleAuthUrl,
  googleCallback: authApi.googleCallback,
  getUserProfile: userApi.getProfile,
  updateUserProfile: userApi.updateProfile,
  logout: authUtils.logout,
  isAuthenticated: authUtils.isAuthenticated,
  getAccessToken: authUtils.getAccessToken,
  getRefreshToken: authUtils.getRefreshToken,
  setTokens: authUtils.setTokens,
  refreshTokens: authUtils.refreshTokens,
};
