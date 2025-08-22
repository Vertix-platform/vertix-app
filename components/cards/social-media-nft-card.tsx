'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Wallet, Clock, Users, Shield, TrendingUp } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, formatAddress, formatNumber } from '@/lib/custom-utils';

export interface SocialMediaNftListing {
  id: string;
  listing_id: number;
  creator_address: string;
  token_id: number;
  price: number;
  description: string;
  social_media_id: string;
  signature: string;
  active: boolean;
  is_auction: boolean;
  transaction_hash: string;
  block_number: number;
  created_at: string;
  updated_at: string;
  // Additional metadata that might come from IPFS
  metadata?: {
    name?: string;
    description?: string;
    image?: string;
    attributes?: Array<{
      trait_type: string;
      value: string;
    }>;
    social_media_data?: {
      platform: string;
      username: string;
      followers: number;
      posts: number;
      engagement_rate: number;
      verified: boolean;
      profile_image?: string;
    };
  };
}

interface SocialMediaNftCardProps {
  listing: SocialMediaNftListing;
  onBuy?: (listingId: number) => void;
  onBid?: (listingId: number) => void;
  className?: string;
}

export const SocialMediaNftCard = ({ listing, onBuy, onBid, className = '' }: SocialMediaNftCardProps) => {

  const getImageUrl = () => {
    if (listing.metadata?.social_media_data?.profile_image) {
      return listing.metadata.social_media_data.profile_image;
    }
    if (listing.metadata?.image) {
      return listing.metadata.image;
    }
    // Fallback to a placeholder
    return '/images/social-media-placeholder.png';
  };

  const getDisplayName = () => {
    if (listing.metadata?.name) {
      return listing.metadata.name;
    }
    if (listing.metadata?.social_media_data) {
      return `@${listing.metadata.social_media_data.username}`;
    }
    return `Social Media NFT #${listing.token_id}`;
  };

  const getPlatformBadge = () => {
    if (!listing.metadata?.social_media_data?.platform) return null;

    const platform = listing.metadata.social_media_data.platform.toLowerCase();
    const platformColors = {
      'x': 'bg-black',
      'twitter': 'bg-black',
      'instagram': 'bg-gradient-to-r from-purple-500 to-pink-500',
      'facebook': 'bg-blue-600',
      'youtube': 'bg-red-600',
      'tiktok': 'bg-black',
    };

    return (
      <Badge className={`${platformColors[platform as keyof typeof platformColors] || 'bg-gray-500'} text-white`}>
        {listing.metadata.social_media_data.platform}
      </Badge>
    );
  };

  const getSocialMetrics = () => {
    if (!listing.metadata?.social_media_data) return null;
    
    const data = listing.metadata.social_media_data;
    return (
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="font-bold text-primary">{formatNumber(data.followers)}</div>
          <div className="text-muted-foreground">Followers</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-primary">{formatNumber(data.posts)}</div>
          <div className="text-muted-foreground">Posts</div>
        </div>
      </div>
    );
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* Social Media Profile Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        <Image
          src={getImageUrl()}
          alt={getDisplayName()}
          className="w-full h-full object-cover"
          width={300}
          height={300}
        />

        {/* Platform Badge */}
        <div className="absolute top-2 left-2">
          {getPlatformBadge()}
        </div>

        {/* Auction Badge */}
        {listing.is_auction && (
          <Badge className="absolute top-2 right-2 bg-orange-500 hover:bg-orange-600">
            <Clock className="h-3 w-3 mr-1" />
            Auction
          </Badge>
        )}

        {/* Verification Badge */}
        {listing.metadata?.social_media_data?.verified && (
          <Badge className="absolute bottom-2 left-2 bg-blue-500 hover:bg-blue-600">
            <Shield className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        )}

        {/* Sold Overlay */}
        {!listing.active && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Badge variant="secondary" className="text-white bg-gray-600">
              Sold
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-1">
              {getDisplayName()}
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {listing.metadata?.description || listing.description}
            </CardDescription>
          </div>
        </div>

        {/* Social Media Metrics */}
        {getSocialMetrics() && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            {getSocialMetrics()}
            {listing.metadata?.social_media_data?.engagement_rate && (
              <div className="text-center mt-2">
                <div className="text-sm text-muted-foreground">
                  Engagement Rate: {listing.metadata.social_media_data.engagement_rate.toFixed(2)}%
                </div>
              </div>
            )}
          </div>
        )}

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Creator: {formatAddress(listing.creator_address)}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-sm text-muted-foreground">Price</span>
            <div className="text-xl font-bold text-primary">
              {formatPrice(listing.price)}
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-muted-foreground">Token ID</span>
            <div className="text-sm font-mono">#{listing.token_id}</div>
          </div>
        </div>

        {/* Action Buttons */}
        {listing.active && (
          <div className="flex gap-2">
            {listing.is_auction ? (
              <Button 
                onClick={() => onBid?.(listing.listing_id)}
                className="flex-1"
                size="sm"
              >
                Place Bid
              </Button>
            ) : (
              <Button 
                onClick={() => onBuy?.(listing.listing_id)}
                className="flex-1"
                size="sm"
              >
                Buy Now
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              size="sm"
            >
              <Link href={`/social-media-nft/${listing.listing_id}`}>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* Social Media Details */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Social Media ID:</span>
              <div className="font-mono text-xs truncate">{listing.social_media_id}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Listing ID:</span>
              <div className="font-mono text-xs">#{listing.listing_id}</div>
            </div>
          </div>
        </div>

        {/* Special Features */}
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Creator-branded NFT with utility features</span>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};
