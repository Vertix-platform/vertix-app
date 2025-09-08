// Authentication Types - Matching Rust Backend DTOs
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface RevokeTokenRequest {
  refresh_token: string;
}

export interface RevokeTokenResponse {
  message: string;
}

export interface GoogleCallbackQuery {
  code: string;
  state: string;
}

export interface GoogleAuthResponse {
  auth_url: string;
}

export interface ConnectWalletRequest {
  wallet_address: string;
  signature: string;
  nonce: string;
}

export interface NonceRequest {
  wallet_address: string;
}

export interface NonceResponse {
  nonce: string;
}

// User Types
export interface UserResponse {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  username?: string;
  wallet_address?: string;
  is_verified: boolean;
  created_at: string;
}

export interface UpdateProfileRequest {
  username?: string;
}

export interface ErrorResponse {
  error: string;
}

// Privy Types - Updated to match actual Privy User type
export interface PrivyUser {
  id: string;
  email?: {
    address: string;
    verified: boolean;
  };
  wallet?: {
    address: string;
    chainId: number;
  };
  linkedAccounts: Array<{
    type: 'email' | 'wallet';
    verifiedAt: string;
  }>;
}

// Auth State Types
export interface AuthState {
  user: UserResponse | null;
  privyUser: PrivyUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthActions {
  login: (
    userData: UserResponse,
    tokens: { access_token: string; refresh_token: string }
  ) => void;
  logout: () => void;
  setPrivyUser: (privyUser: PrivyUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  checkAuth: () => Promise<boolean>;
  refreshAccessToken: () => Promise<boolean>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}

export type AuthStore = AuthState & AuthActions;

// API Response Types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

// Environment Variables
export interface AuthConfig {
  RUST_BACKEND_URL: string;
  PRIVY_APP_ID: string;
  PRIVY_CLIENT_ID: string;
}
