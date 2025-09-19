export interface MintNftRequest {
  wallet_address: string;
  token_uri: string;
  metadata_hash: string;
  collection_id?: number;
  royalty_bps?: number;
}

export interface MintNftToCollectionRequest {
  wallet_address: string;
  collection_id: number;
  token_uri: string;
  metadata_hash: string;
  royalty_bps?: number;
}

export interface MintNftResponse {
  success: boolean;
  data?: {
    token_id: number;
    transaction_hash: string;
    block_number: number;
  };
  error?: string;
}

export interface MintNftToCollectionResponse {
  success: boolean;
  data?: {
    to: string;
    collection_id: number;
    token_id: number;
    uri: string;
    metadata_hash: string;
    royalty_recipient: string;
    royalty_bps: number;
    transaction_hash: string;
    block_number: number;
  };
  error?: string;
}

export interface InitiateSocialMediaNftMintRequest {
  platform: 'x' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'twitch';
  user_id: string;
  username: string;
  display_name: string;
  profile_image_url?: string;
  follower_count?: number;
  verified: boolean;
  access_token: string;
  custom_image_url?: string;
  royalty_bps?: number;
}

export interface InitiateSocialMediaNftMintResponse {
  success: boolean;
  data?: {
    social_media_id: string;
    token_uri: string;
    metadata_hash: string;
    signature: string;
    royalty_bps: number;
    metadata: string;
  };
  error?: string;
}

export interface MintSocialMediaNftRequest {
  wallet_address: string;
  social_media_id: string;
  token_uri: string;
  metadata_hash: string;
  royalty_bps?: number;
  signature: string;
}

export interface MintSocialMediaNftResponse {
  success: boolean;
  data?: {
    token_id: number;
    social_media_id: string;
    transaction_hash: string;
    block_number: number;
  };
  error?: string;
}

export interface NetworkInfo {
  chain_id: number;
  chain_name: string;
  chain_type: 'polygon' | 'base';
  rpc_url: string;
  explorer_url: string;
  native_currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  gas_settings: {
    default_gas_limit: number;
    max_gas_limit: number;
    block_time_seconds: number;
  };
}

export interface Collection {
  collection_id: number;
  chain_id: number;
  name: string;
  symbol: string;
  image: string;
  max_supply: number;
  creator: string;
  current_supply: number;
}

export interface CollectionsResponse {
  collections: Collection[];
  total_count: number;
  limit: number;
  offset: number;
}

export interface CreateCollectionRequest {
  wallet_address: string;
  name: string;
  symbol: string;
  image: string;
  max_supply: number;
}

export interface CreateCollectionResponse {
  success: boolean;
  data?: {
    collection_id: number;
    creator: string;
    name: string;
    symbol: string;
    image: string;
    max_supply: number;
    current_supply: number;
    token_ids: number[];
    transaction_hash: string;
    block_number: number;
  };
  error?: string;
}
