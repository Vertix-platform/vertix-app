import { AuthConfig } from '@/types/auth';
import {
  base,
  baseSepolia,
  polygon,
  polygonZkEvm,
  polygonZkEvmCardona,
} from 'viem/chains';

export const authConfig: AuthConfig = {
  RUST_BACKEND_URL:
    process.env.NEXT_PUBLIC_RUST_BACKEND_URL || 'http://0.0.0.0:8080',
  PRIVY_APP_ID: process.env.NEXT_PUBLIC_PRIVY_APP_ID || '',
  PRIVY_CLIENT_ID: process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID as string,
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/api/v1/auth/register',
    LOGIN: '/api/v1/auth/login',
    REFRESH: '/api/v1/auth/refresh',
    REVOKE: '/api/v1/auth/revoke',
    REVOKE_ALL: '/api/v1/auth/revoke-all',
    GOOGLE_AUTH: '/api/v1/auth/google-auth',
    GOOGLE_CALLBACK: '/api/v1/auth/google-callback',
    CONNECT_WALLET: '/api/v1/auth/connect-wallet',
    NONCE: '/api/v1/auth/nonce',
  },
  USER: {
    PROFILE: '/api/v1/users/profile',
    UPDATE_PROFILE: '/api/v1/users/profile',
  },
  CONTRACT: {
    NETWORK_INFO: '/api/v1/contracts/network-info',
    SUPPORTED_CHAINS: '/api/v1/contracts/supported-chains',
    CHECK_CONNECTION: '/api/v1/contracts/check-connection',
    COLLECTIONS: '/api/v1/contracts/collections',
    USER_NFTS: '/api/v1/contracts/user-nfts',
    LISTINGS: '/api/v1/contracts/listings',
    MINT_SOCIAL_MEDIA_NFT: '/api/v1/contracts/mint-social-media-nft',
    INITIATE_SOCIAL_MEDIA_NFT_MINT:
      '/api/v1/contracts/initiate-social-media-nft-mint',
    LIST_SOCIAL_MEDIA_NFT: '/api/v1/contracts/list-social-media-nft',
    LIST_NFT_FOR_AUCTION: '/api/v1/contracts/list-nft-for-auction',
    BUY_NFT: '/api/v1/contracts/buy-nft',
    CANCEL_NFT_LISTING: '/api/v1/contracts/cancel-nft-listing',
    LIST_NON_NFT_ASSET: '/api/v1/contracts/list-non-nft-asset',
    BUY_NON_NFT_ASSET: '/api/v1/contracts/buy-non-nft-asset',
    CANCEL_NON_NFT_LISTING: '/api/v1/contracts/cancel-non-nft-listing',
    CONFIRM_TRANSFER: '/api/v1/contracts/confirm-transfer',
    RAISE_DISPUTE: '/api/v1/contracts/raise-dispute',
    REFUND: '/api/v1/contracts/refund',
    CREATE_COLLECTION: '/api/v1/contracts/create-collection',
    LIST_NON_NFT: '/api/v1/contracts/list-non-nft',
    BUY_NFT_FOR_AUCTION: '/api/v1/contracts/buy-nft-for-auction',
    BUY_NON_NFT_ASSET_FOR_AUCTION:
      '/api/v1/contracts/buy-non-nft-asset-for-auction',
  },
  DASHBOARD: {
    CREATOR_LISTINGS: '/api/v1/contracts/creator-listings',
    CREATOR_ANALYTICS: '/api/v1/dashboard/analytics',
  },
};

export const PRIVY_CONFIG = {
  appId: authConfig.PRIVY_APP_ID,
  clientId: authConfig.PRIVY_CLIENT_ID,
  config: {
    appearance: {
      logo: '/images/vertix.png',
      theme: 'dark' as const,
      accentColor: '#676FFF' as const,
      showWalletLoginFirst: true,
    },
    defaultChain: polygonZkEvmCardona,
    supportedChains: [
      polygon,
      polygonZkEvmCardona,
      polygonZkEvm,
      baseSepolia,
      base,
    ],
  },
};

export const PAGE_ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/login',
    SIGNUP: '/signup',
  },
  LISTINGS_SECTION: {
    NFT_LISTINGS: '/listings',
    NON_NFT_LISTINGS: '/non-nft-listings',
    SOCIAL_MEDIA_LISTINGS: '/social-media-listings',
    LISTING_DETAILS: '/listing/',
    NON_NFT_LISTING_DETAILS: '/non-nft-listings/',
    SOCIAL_MEDIA_LISTING_DETAILS: '/social-media-listings/',
  },
  CREATORS_SECTION: {
    CREATORS: '/creators',
    CREATOR_DETAILS: '/creators/',
  },
  COLLECTIONS_SECTION: {
    COLLECTIONS: '/collections',
    CREATE_COLLECTION: '/collections/create',
    COLLECTION_DETAILS: '/collections/',
  },
  MARKETPLACE_SECTION: {
    MARKETPLACE: '/marketplace',
  },
  MINT_SECTION: {
    MINT: '/mint',
    MINT_NFT: '/mint/nft',
    MINT_SOCIAL_MEDIA_NFT: '/mint/social-media-nft',
    MINT_NON_NFT_ASSET: '/mint/non-nft-asset',
  },
};
