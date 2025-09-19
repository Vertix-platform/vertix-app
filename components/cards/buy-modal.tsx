'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Listing } from '@/hooks/use-listings';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/custom-utils';
import {
  ShoppingCart,
  Gavel,
  Hash,
  Users,
  Globe,
  FileText,
  Package,
  Link2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usePrivy } from '@privy-io/react-auth';
import { parseEther } from 'viem';
import { useBuyNft } from '@/hooks/use-buy-nft';
import { usePlaceBid } from '@/hooks/use-place-bid';

interface BuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
}

export function BuyModal({ isOpen, onClose, listing }: BuyModalProps) {
  const [bidAmount, setBidAmount] = useState('');
  const { user: privyUser, authenticated } = usePrivy();

  // Contract interaction hooks
  const {
    buyNft,
    isProcessing: isBuyProcessing,
    isSuccess: isBuySuccess,
    error: buyError,
    reset: resetBuy,
  } = useBuyNft();

  const {
    placeBid,
    isProcessing: isBidProcessing,
    isSuccess: isBidSuccess,
    error: bidError,
    reset: resetBid,
  } = usePlaceBid();

  const isProcessing = isBuyProcessing || isBidProcessing;

  const convertIpfsToHttp = (ipfsUrl: string) => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  const getAssetTypeIcon = (assetType: number) => {
    switch (assetType) {
      case 0:
        return <Package className='w-4 h-4' />;
      case 1:
        return <Users className='w-4 h-4' />;
      case 2:
        return <Globe className='w-4 h-4' />;
      case 3:
        return <Link2 className='w-4 h-4' />;
      case 4:
        return <FileText className='w-4 h-4' />;
      default:
        return <Package className='w-4 h-4' />;
    }
  };

  const getAssetTypeColor = (assetType: number) => {
    switch (assetType) {
      case 0:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 1:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 2:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 3:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 4:
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const handleBuyNow = async () => {
    if (!authenticated || !privyUser?.wallet?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    try {
      const result = await buyNft({
        listingId: listing.listing_id,
        price: listing.price_wei,
      });

      if (result.success) {
        toast.success('Purchase transaction submitted!');
      }
    } catch (error) {
      console.error('Buy error:', error);
      toast.error('Purchase failed. Please try again.');
    }
  };

  const handlePlaceBid = async () => {
    if (!authenticated || !privyUser?.wallet?.address) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.error('Please enter a valid bid amount');
      return;
    }

    try {
      const bidAmountWei = parseEther(bidAmount);
      const minBid = BigInt(listing.price_wei);

      if (bidAmountWei <= minBid) {
        toast.error(
          `Bid must be higher than current price: ${formatPrice(listing.price_wei)}`
        );
        return;
      }

      // For auctions, we need the auctionId, but for now we'll use listing_id
      // In a real implementation, you'd need to get the auctionId from the listing
      const result = await placeBid({
        auctionId: listing.listing_id, // This should be auctionId in real implementation
        bidAmount: bidAmountWei.toString(),
      });

      if (result.success) {
        toast.success('Bid transaction submitted!');
        setBidAmount(''); // Clear the input
      }
    } catch (error) {
      console.error('Bid error:', error);
      toast.error('Failed to place bid. Please try again.');
    }
  };

  // Handle transaction success
  useEffect(() => {
    if (isBuySuccess) {
      toast.success('Purchase successful!');
      resetBuy();
      onClose();
    }
  }, [isBuySuccess, resetBuy, onClose]);

  useEffect(() => {
    if (isBidSuccess) {
      toast.success('Bid placed successfully!');
      resetBid();
      onClose();
    }
  }, [isBidSuccess, resetBid, onClose]);

  // Handle transaction errors
  useEffect(() => {
    if (buyError) {
      toast.error(`Purchase failed: ${buyError}`);
    }
  }, [buyError]);

  useEffect(() => {
    if (bidError) {
      toast.error(`Bid failed: ${bidError}`);
    }
  }, [bidError]);

  // Reset states when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      resetBuy();
      resetBid();
      setBidAmount('');
    }
  }, [isOpen, resetBuy, resetBid]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            {listing.is_auction ? (
              <>
                <Gavel className='w-5 h-5 text-blue-600' />
                Place Bid
              </>
            ) : (
              <>
                <ShoppingCart className='w-5 h-5 text-green-600' />
                Buy Now
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {listing.is_auction
              ? 'Place your bid for this auction item'
              : 'Complete your purchase of this item'}
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          {/* Item Details */}
          <Card>
            <CardContent className='p-4'>
              <div className='flex gap-4'>
                {/* Image */}
                <div className='w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 flex-shrink-0'>
                  {listing.image ? (
                    <Image
                      src={convertIpfsToHttp(listing.image)}
                      alt={listing.name}
                      width={96}
                      height={96}
                      className='w-full h-full object-cover'
                      unoptimized
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center'>
                      <Package className='w-8 h-8 text-gray-400' />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className='flex-1 min-w-0'>
                  <div className='flex items-start justify-between mb-2'>
                    <h3 className='font-semibold text-lg truncate'>
                      {listing.name}
                    </h3>
                    <Badge
                      className={`${getAssetTypeColor(listing.asset_type)} flex items-center gap-1`}
                    >
                      {getAssetTypeIcon(listing.asset_type)}
                      {listing.asset_type_name}
                    </Badge>
                  </div>

                  <div className='space-y-1 text-sm text-muted-foreground'>
                    <div className='flex items-center gap-2'>
                      <Hash className='w-3 h-3' />
                      <span>Token #{listing.token_id}</span>
                    </div>
                    <div>
                      <span className='font-medium'>Collection:</span>{' '}
                      {listing.collection_name}
                    </div>
                    <div>
                      <span className='font-medium'>Seller:</span>{' '}
                      {listing.seller_address.slice(0, 6)}...
                      {listing.seller_address.slice(-4)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <div className='space-y-4'>
            <div className='flex justify-between items-center p-4 bg-muted rounded-lg'>
              <div>
                <p className='text-sm text-muted-foreground'>
                  {listing.is_auction ? 'Current Price' : 'Price'}
                </p>
                <p className='text-2xl font-bold'>
                  {formatPrice(listing.price_wei)}
                </p>
                {listing.is_auction && listing.reserve_price_wei && (
                  <p className='text-xs text-muted-foreground'>
                    Reserve: {formatPrice(listing.reserve_price_wei)}
                  </p>
                )}
              </div>
              {listing.is_auction && listing.auction_end_time && (
                <div className='text-right'>
                  <p className='text-sm text-muted-foreground'>Auction Ends</p>
                  <p className='font-semibold text-green-600'>Live</p>
                </div>
              )}
            </div>

            {/* Bid Input (for auctions) */}
            {listing.is_auction && (
              <div className='space-y-2'>
                <Label htmlFor='bidAmount'>Your Bid (ETH)</Label>
                <Input
                  id='bidAmount'
                  type='number'
                  step='0.001'
                  min={parseFloat(formatPrice(listing.price_wei))}
                  placeholder={`Minimum: ${formatPrice(listing.price_wei)}`}
                  value={bidAmount}
                  onChange={e => setBidAmount(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className='flex gap-3'>
            <Button
              variant='outline'
              onClick={onClose}
              className='flex-1'
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={listing.is_auction ? handlePlaceBid : handleBuyNow}
              disabled={isProcessing}
              className={`flex-1 bg-accent hover:bg-accent/50 text-white transition-all duration-200 shadow-lg hover:shadow-xl`}
            >
              {isProcessing ? (
                'Processing...'
              ) : listing.is_auction ? (
                <>
                  <Gavel className='w-4 h-4 mr-2' />
                  Place Bid
                </>
              ) : (
                <>
                  <ShoppingCart className='w-4 h-4 mr-2' />
                  Buy Now
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
