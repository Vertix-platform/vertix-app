'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Wallet, Globe, Users, Monitor, Smartphone, Play, Shield } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, formatAddress, formatNumber } from '@/lib/custom-utils';

export interface NonNftListing {
  id: string;
  listing_id: number;
  creator_address: string;
  asset_type: number; // 1=SocialMedia, 2=Domain, 3=App, 4=Website, 5=Youtube, 6=Other
  asset_id: string;
  price: number;
  description: string;
  platform?: string;
  identifier?: string;
  metadata_uri?: string;
  verification_proof?: string;
  transaction_hash: string;
  block_number: number;
  created_at: string;
  updated_at: string;
  // Additional metadata that might come from verification
  verification_data?: {
    followers?: number;
    subscribers?: number;
    views?: number;
    traffic?: number;
    revenue?: number;
    domain_age?: number;
    page_rank?: number;
    social_score?: number;
  };
}

interface NonNftCardProps {
  listing: NonNftListing;
  onBuy?: (listingId: number) => void;
  className?: string;
}

export const NonNftCard = ({ listing, onBuy, className = '' }: NonNftCardProps) => {

  const getAssetTypeInfo = () => {
    switch (listing.asset_type) {
      case 1:
        return {
          name: 'Social Media',
          icon: Users,
          color: 'bg-blue-500',
          description: 'Social media account or profile'
        };
      case 2:
        return {
          name: 'Domain',
          icon: Globe,
          color: 'bg-green-500',
          description: 'Domain name or website'
        };
      case 3:
        return {
          name: 'Application',
          icon: Smartphone,
          color: 'bg-purple-500',
          description: 'Mobile app or software'
        };
      case 4:
        return {
          name: 'Website',
          icon: Monitor,
          color: 'bg-indigo-500',
          description: 'Website or web application'
        };
      case 5:
        return {
          name: 'YouTube',
          icon: Play,
          color: 'bg-red-500',
          description: 'YouTube channel or video'
        };
      default:
        return {
          name: 'Other',
          icon: Shield,
          color: 'bg-gray-500',
          description: 'Other digital asset'
        };
    }
  };

  const getAssetDisplayName = () => {
    if (listing.platform && listing.identifier) {
      return `${listing.platform}/${listing.identifier}`;
    }
    return listing.asset_id;
  };

  const getVerificationBadge = () => {
    if (listing.verification_proof) {
      return (
        <Badge className="bg-green-500 hover:bg-green-600 text-white">
          <Shield className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    return null;
  };

  const getMetricsDisplay = () => {
    if (!listing.verification_data) return null;

    const metrics = [];
    if (listing.verification_data.followers) {
      metrics.push(`${listing.verification_data.followers.toLocaleString()} followers`);
    }
    if (listing.verification_data.subscribers) {
      metrics.push(`${listing.verification_data.subscribers.toLocaleString()} subscribers`);
    }
    if (listing.verification_data.views) {
      metrics.push(`${listing.verification_data.views.toLocaleString()} views`);
    }
    if (listing.verification_data.traffic) {
      metrics.push(`${listing.verification_data.traffic.toLocaleString()} monthly visits`);
    }
    if (listing.verification_data.revenue) {
      metrics.push(`$${listing.verification_data.revenue.toLocaleString()}/month`);
    }

    return metrics.length > 0 ? metrics.join(' • ') : null;
  };

  const assetTypeInfo = getAssetTypeInfo();
  const AssetIcon = assetTypeInfo.icon;

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* Asset Header */}
      <div className="relative p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${assetTypeInfo.color} text-white`}>
              <AssetIcon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">
                {getAssetDisplayName()}
              </CardTitle>
              <CardDescription className="text-sm">
                {assetTypeInfo.description}
              </CardDescription>
            </div>
          </div>
          {getVerificationBadge()}
        </div>
      </div>

      <CardContent className="p-4">
        {/* Description */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {listing.description}
          </p>
        </div>

        {/* Metrics */}
        {getMetricsDisplay() && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm font-medium text-muted-foreground mb-1">Metrics</div>
            <div className="text-sm">{getMetricsDisplay()}</div>
          </div>
        )}

        {/* Creator Info */}
        <div className="flex items-center gap-2 mb-4">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Seller: {formatAddress(listing.creator_address)}
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
            <span className="text-sm text-muted-foreground">Asset Type</span>
            <div className="text-sm font-medium">{assetTypeInfo.name}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            onClick={() => onBuy?.(listing.listing_id)}
            className="flex-1"
            size="sm"
          >
            Buy Now
          </Button>
          <Button 
            asChild 
            variant="outline" 
            size="sm"
          >
            <Link href={`/non-nft/${listing.listing_id}`}>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Asset Details */}
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Asset ID:</span>
              <div className="font-mono text-xs truncate">{listing.asset_id}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Listing ID:</span>
              <div className="font-mono text-xs">#{listing.listing_id}</div>
            </div>
          </div>
        </div>

        {/* Verification Status */}
        {listing.verification_proof && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">
                Verified by Vertix Labs
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
