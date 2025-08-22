'use client';

import { NftCard, type NftListing } from './nft-card';
import { NonNftCard, type NonNftListing } from './non-nft-card';
import { SocialMediaNftCard, type SocialMediaNftListing } from './social-media-nft-card';

export type ListingType = 'nft' | 'non-nft' | 'social-media-nft';

export interface BaseListing {
  id: string;
  listing_id: number;
  creator_address: string;
  price: number;
  description: string;
  active: boolean;
  transaction_hash: string;
  block_number: number;
  created_at: string;
  updated_at: string;
}

export interface ListingCardProps {
  listing: NftListing | NonNftListing | SocialMediaNftListing;
  type: ListingType;
  onBuy?: (listingId: number) => void;
  onBid?: (listingId: number) => void;
  className?: string;
}

export const ListingCard = ({ listing, type, onBuy, onBid, className }: ListingCardProps) => {
  switch (type) {
    case 'nft':
      return (
        <NftCard
          listing={listing as NftListing}
          onBuy={onBuy}
          onBid={onBid}
          className={className}
        />
      );

    case 'non-nft':
      return (
        <NonNftCard
          listing={listing as NonNftListing}
          onBuy={onBuy}
          className={className}
        />
      );

    case 'social-media-nft':
      return (
        <SocialMediaNftCard
          listing={listing as SocialMediaNftListing}
          onBuy={onBuy}
          onBid={onBid}
          className={className}
        />
      );
    
    default:
      return null;
  }
};

// Helper function to determine listing type from backend data
export const getListingType = (listing: any): ListingType => {
  // Check for social media NFT specific fields
  if ('social_media_id' in listing && 'token_id' in listing) {
    return 'social-media-nft';
  }
  
  // Check for non-NFT specific fields
  if ('asset_type' in listing && 'asset_id' in listing) {
    return 'non-nft';
  }
  
  // Default to regular NFT
  return 'nft';
};

// Helper function to get asset type name for non-NFT listings
export const getAssetTypeName = (assetType: number): string => {
  switch (assetType) {
    case 1:
      return 'Social Media';
    case 2:
      return 'Domain';
    case 3:
      return 'Application';
    case 4:
      return 'Website';
    case 5:
      return 'YouTube';
    case 6:
      return 'Other';
    default:
      return 'Unknown';
  }
};

// Helper function to get asset type color for non-NFT listings
export const getAssetTypeColor = (assetType: number): string => {
  switch (assetType) {
    case 1:
      return 'bg-blue-500';
    case 2:
      return 'bg-green-500';
    case 3:
      return 'bg-purple-500';
    case 4:
      return 'bg-indigo-500';
    case 5:
      return 'bg-red-500';
    case 6:
      return 'bg-gray-500';
    default:
      return 'bg-gray-500';
  }
};
