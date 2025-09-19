'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCancelNftListing } from '@/hooks/use-cancel-nft-listing';
import { useBuyNft } from '@/hooks/use-buy-nft';
import { useAccount } from 'wagmi';
import { formatPrice, formatAddress } from '@/lib/custom-utils';
import {
  Loader2,
  X,
  ShoppingCart,
  ExternalLink,
  Clock,
  Tag,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import Link from 'next/link';

export interface NftListingData {
  listingId: number;
  seller: string;
  nftContract: string;
  tokenId: number;
  price: string; // Price in wei as string
  active: boolean;
  isAuction: boolean;
  isCrossChain: boolean;
  createdAt: string;
  // NFT metadata
  name?: string;
  image?: string;
  description?: string;
  collection?: {
    name: string;
    family: string;
  };
  attributes?: Array<{
    trait_type: string;
    value: string;
  }>;
}

interface NFTListingCardProps {
  listing: NftListingData;
  onListingCancelled?: (listingId: number) => void;
  onNftPurchased?: (listingId: number) => void;
  className?: string;
}

export const NFTListingCard = ({
  listing,
  onListingCancelled,
  onNftPurchased,
  className = '',
}: NFTListingCardProps) => {
  const { address } = useAccount();
  const {
    cancelNftListing,
    isLoading: isCancelling,
    isPending: isCancelPending,
    isSuccess: isCancelSuccess,
    canCancel,
    isProcessing: isCancelProcessing,
  } = useCancelNftListing();
  const {
    buyNft,
    isLoading: isBuying,
    isPending: isBuyPending,
    isSuccess: isBuySuccess,
    canBuy,
    isProcessing: isBuyProcessing,
  } = useBuyNft();

  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isOwner = address?.toLowerCase() === listing.seller.toLowerCase();
  const priceInEth = (parseFloat(listing.price) / 1e18).toFixed(4);

  const handleCancelListing = async () => {
    const result = await cancelNftListing({ listingId: listing.listingId });

    if (result.success) {
      onListingCancelled?.(listing.listingId);
      setShowCancelConfirm(false);
    }
  };

  const handleBuyNft = async () => {
    const result = await buyNft({
      listingId: listing.listingId,
      price: listing.price,
    });

    if (result.success) {
      onNftPurchased?.(listing.listingId);
    }
  };

  const getImageUrl = () => {
    if (listing.image) {
      return listing.image;
    }
    return '/images/nft-placeholder.png';
  };

  const getDisplayName = () => {
    if (listing.name) {
      return listing.name;
    }
    return `NFT #${listing.tokenId}`;
  };

  if (isCancelSuccess) {
    return (
      <Card className={`border-orange-200 bg-orange-50 ${className}`}>
        <CardContent className='p-6'>
          <div className='text-center'>
            <div className='w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <X className='w-6 h-6 text-orange-600' />
            </div>
            <h3 className='text-lg font-semibold text-orange-800 mb-2'>
              Listing Cancelled
            </h3>
            <p className='text-orange-600'>
              Your NFT has been returned to your wallet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isBuySuccess) {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardContent className='p-6'>
          <div className='text-center'>
            <div className='w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <ShoppingCart className='w-6 h-6 text-green-600' />
            </div>
            <h3 className='text-lg font-semibold text-green-800 mb-2'>
              Purchase Successful!
            </h3>
            <p className='text-green-600'>You now own this NFT.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

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
        {listing.isAuction && (
          <Badge className='absolute top-2 right-2 bg-orange-500 hover:bg-orange-600'>
            <Clock className='h-3 w-3 mr-1' />
            Auction
          </Badge>
        )}
        {listing.isCrossChain && (
          <Badge className='absolute top-2 left-2 bg-blue-500 hover:bg-blue-600'>
            Cross-Chain
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
              {listing.description}
            </CardDescription>
          </div>
        </div>

        {/* Collection Info */}
        {listing.collection && (
          <div className='flex items-center gap-2 mb-3'>
            <Tag className='h-4 w-4 text-muted-foreground' />
            <span className='text-sm font-medium text-primary'>
              {listing.collection.name}
            </span>
          </div>
        )}

        {/* Seller Info */}
        <div className='flex items-center gap-2 mb-3'>
          <span className='text-sm text-muted-foreground'>
            {isOwner
              ? 'Your listing'
              : `Seller: ${formatAddress(listing.seller)}`}
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
            <div className='text-sm font-mono'>#{listing.tokenId}</div>
          </div>
        </div>

        {/* Action Buttons */}
        {listing.active && (
          <div className='flex gap-2'>
            {isOwner ? (
              // Owner actions
              <>
                {!showCancelConfirm ? (
                  <Button
                    onClick={() => setShowCancelConfirm(true)}
                    variant='destructive'
                    className='flex-1'
                    size='sm'
                    disabled={isCancelProcessing}
                  >
                    {isCancelProcessing ? (
                      <>
                        <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                        Cancelling...
                      </>
                    ) : (
                      'Cancel Listing'
                    )}
                  </Button>
                ) : (
                  <div className='flex gap-2 flex-1'>
                    <Button
                      onClick={handleCancelListing}
                      variant='destructive'
                      size='sm'
                      disabled={!canCancel || isCancelProcessing}
                    >
                      {isCancelProcessing ? (
                        <>
                          <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                          Cancelling...
                        </>
                      ) : (
                        'Confirm Cancel'
                      )}
                    </Button>
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant='outline'
                      size='sm'
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </>
            ) : (
              // Buyer actions
              <Button
                onClick={handleBuyNft}
                className='flex-1'
                size='sm'
                disabled={!canBuy || isBuyProcessing}
              >
                {isBuyProcessing ? (
                  <>
                    <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                    {isBuying
                      ? 'Preparing...'
                      : isBuyPending
                        ? 'Buying...'
                        : 'Processing...'}
                  </>
                ) : (
                  <>
                    <ShoppingCart className='h-4 w-4 mr-2' />
                    Buy Now
                  </>
                )}
              </Button>
            )}
            <Button asChild variant='outline' size='sm'>
              <Link href={`/nft/${listing.listingId}`}>
                <ExternalLink className='h-4 w-4' />
              </Link>
            </Button>
          </div>
        )}

        {/* Attributes */}
        {listing.attributes && listing.attributes.length > 0 && (
          <div className='mt-3 pt-3 border-t'>
            <div className='flex flex-wrap gap-1'>
              {listing.attributes.slice(0, 3).map((attr, index) => (
                <Badge key={index} variant='outline' className='text-xs'>
                  {attr.trait_type}: {attr.value}
                </Badge>
              ))}
              {listing.attributes.length > 3 && (
                <Badge variant='outline' className='text-xs'>
                  +{listing.attributes.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
};
