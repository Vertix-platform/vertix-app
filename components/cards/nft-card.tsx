'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Wallet, Clock, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, formatAddress } from '@/lib/custom-utils';

export interface NftListing {
  id: string;
  listing_id: number;
  creator_address: string;
  nft_contract: string;
  token_id: number;
  price: number;
  description: string;
  active: boolean;
  is_auction: boolean;
  metadata_uri?: string;
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
    collection?: {
      name: string;
      family: string;
    };
  };
}

interface NftCardProps {
  listing: NftListing;
  onBuy?: (listingId: number) => void;
  onBid?: (listingId: number) => void;
  className?: string;
}

export const NftCard = ({
  listing,
  onBuy,
  onBid,
  className = '',
}: NftCardProps) => {
  const getImageUrl = () => {
    if (listing.metadata?.image) {
      return listing.metadata.image;
    }
    // Fallback to a placeholder or default NFT image
    return '/images/nft-placeholder.png';
  };

  const getDisplayName = () => {
    if (listing.metadata?.name) {
      return listing.metadata.name;
    }
    return `NFT #${listing.token_id}`;
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      {/* NFT Image */}
      <div className='relative aspect-square overflow-hidden rounded-t-lg'>
        <Image
          src={getImageUrl()}
          alt={getDisplayName()}
          className='w-full h-full object-cover'
          width={300}
          height={300}
        />
        {listing.is_auction && (
          <Badge className='absolute top-2 right-2 bg-orange-500 hover:bg-orange-600'>
            <Clock className='h-3 w-3 mr-1' />
            Auction
          </Badge>
        )}
        {!listing.active && (
          <div className='absolute inset-0 bg-black/50 flex items-center justify-center'>
            <Badge variant='secondary' className='text-white bg-gray-600'>
              Sold
            </Badge>
          </div>
        )}
      </div>

      <CardHeader className='p-4'>
        <div className='flex items-start justify-between'>
          <div className='flex-1'>
            <CardTitle className='text-lg font-semibold mb-1'>
              {getDisplayName()}
            </CardTitle>
            <CardDescription className='text-sm text-muted-foreground mb-2'>
              {listing.metadata?.description || listing.description}
            </CardDescription>
          </div>
        </div>

        {/* Collection Info */}
        {listing.metadata?.collection && (
          <div className='flex items-center gap-2 mb-3'>
            <Tag className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium text-primary'>
              {listing.metadata.collection.name}
            </span>
          </div>
        )}

        {/* Creator Info */}
        <div className='flex items-center gap-2 mb-3'>
          <Wallet className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm text-muted-foreground'>
            Creator: {formatAddress(listing.creator_address)}
          </span>
        </div>

        {/* Price */}
        <div className='flex items-center justify-between mb-4'>
          <div>
            <span className='text-sm text-muted-foreground'>Price</span>
            <div className='text-xl font-bold text-primary'>
              {formatPrice(listing.price)}
            </div>
          </div>
          <div className='text-right'>
            <span className='text-sm text-muted-foreground'>Token ID</span>
            <div className='text-sm font-mono'>#{listing.token_id}</div>
          </div>
        </div>

        {/* Action Buttons */}
        {listing.active && (
          <div className='flex gap-2'>
            {listing.is_auction ? (
              <Button
                onClick={() => onBid?.(listing.listing_id)}
                className='flex-1'
                size='sm'
              >
                Place Bid
              </Button>
            ) : (
              <Button
                onClick={() => onBuy?.(listing.listing_id)}
                className='flex-1'
                size='sm'
              >
                Buy Now
              </Button>
            )}
            <Button asChild variant='outline' size='sm'>
              <Link href={`/nft/${listing.listing_id}`}>
                <ExternalLink className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        )}

        {/* Attributes */}
        {listing.metadata?.attributes &&
          listing.metadata.attributes.length > 0 && (
            <div className='mt-3 pt-3 border-t'>
              <div className='flex flex-wrap gap-1'>
                {listing.metadata.attributes.slice(0, 3).map((attr, index) => (
                  <Badge key={index} variant='outline' className='text-xs'>
                    {attr.trait_type}: {attr.value}
                  </Badge>
                ))}
                {listing.metadata.attributes.length > 3 && (
                  <Badge variant='outline' className='text-xs'>
                    +{listing.metadata.attributes.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}
      </CardHeader>
    </Card>
  );
};
