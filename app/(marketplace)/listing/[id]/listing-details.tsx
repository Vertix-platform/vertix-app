'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useListingDetails } from '@/hooks/use-listing-details';
import { useBuyNft } from '@/hooks/use-buy-nft';
import { usePlaceBid } from '@/hooks/use-place-bid';
import { usePrivy } from '@privy-io/react-auth';
import { formatPrice, formatAddress } from '@/lib/custom-utils';
import { toast } from 'react-hot-toast';
import { parseEther } from 'viem';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Hash,
  Users,
  Globe,
  FileText,
  Package,
  Link2,
  ShoppingCart,
  Gavel,
  ExternalLink,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { PAGE_ROUTES } from '@/lib/config';

interface ListingDetailsProps {
  listingId: string;
}

export function ListingDetails({ listingId }: ListingDetailsProps) {
  const { listing, isLoading, error } = useListingDetails(listingId);
  const { user: privyUser, authenticated } = usePrivy();
  const [bidAmount, setBidAmount] = useState('');

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
        return <Package className='w-5 h-5' />;
      case 1:
        return <Users className='w-5 h-5' />;
      case 2:
        return <Globe className='w-5 h-5' />;
      case 3:
        return <Link2 className='w-5 h-5' />;
      case 4:
        return <FileText className='w-5 h-5' />;
      default:
        return <Package className='w-5 h-5' />;
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

    if (!listing) return;

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

    if (!listing || !bidAmount || parseFloat(bidAmount) <= 0) {
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

      const result = await placeBid({
        auctionId: listing.listing_id, // Note: Should be actual auctionId
        bidAmount: bidAmountWei.toString(),
      });

      if (result.success) {
        toast.success('Bid transaction submitted!');
        setBidAmount('');
      }
    } catch (error) {
      console.error('Bid error:', error);
      toast.error('Failed to place bid. Please try again.');
    }
  };

  // Handle transaction success
  if (isBuySuccess || isBidSuccess) {
    toast.success(
      isBuySuccess ? 'Purchase successful!' : 'Bid placed successfully!'
    );
    resetBuy();
    resetBid();
  }

  // Handle transaction errors
  if (buyError) {
    toast.error(`Purchase failed: ${buyError}`);
  }
  if (bidError) {
    toast.error(`Bid failed: ${bidError}`);
  }

  if (isLoading) {
    return (
      <div className='space-y-8'>
        <div className='animate-pulse'>
          <div className='h-8 bg-gray-200 rounded w-1/3 mb-4'></div>
          <div className='h-4 bg-gray-200 rounded w-1/2'></div>
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          <div className='animate-pulse'>
            <div className='aspect-square bg-gray-200 rounded-lg'></div>
          </div>
          <div className='space-y-6 animate-pulse'>
            <div className='h-8 bg-gray-200 rounded w-3/4'></div>
            <div className='h-4 bg-gray-200 rounded w-1/2'></div>
            <div className='h-20 bg-gray-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='text-center py-12'>
        <AlertCircle className='w-16 h-16 text-red-500 mx-auto mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Error Loading Listing</h2>
        <p className='text-muted-foreground mb-4'>{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className='text-center py-12'>
        <Package className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
        <h2 className='text-2xl font-bold mb-2'>Listing Not Found</h2>
        <p className='text-muted-foreground mb-4'>
          The listing you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link href='/listing'>
          <Button>Back to Listings</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Breadcrumb */}
      <div className='flex items-center gap-2 text-sm text-muted-foreground'>
        <Link
          href={PAGE_ROUTES.MARKETPLACE_SECTION.MARKETPLACE}
          className='hover:text-foreground'
        >
          Marketplace
        </Link>
        <span>/</span>
        <span>Listing #{listing.listing_id}</span>
      </div>

      {/* Main Content */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        {/* Image Section */}
        <div className='space-y-4'>
          <div className='aspect-square bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg overflow-hidden'>
            {listing.image ? (
              <Image
                src={convertIpfsToHttp(listing.image)}
                alt={listing.name}
                width={600}
                height={600}
                className='w-full h-full object-cover'
                unoptimized
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center'>
                <Package className='w-24 h-24 text-gray-400' />
              </div>
            )}
          </div>

          {/* Additional Images or Media */}
          {listing.animation_url && (
            <div className='space-y-2'>
              <h3 className='font-semibold'>Animation</h3>
              <div className='aspect-video bg-gray-100 rounded-lg overflow-hidden'>
                <video
                  src={convertIpfsToHttp(listing.animation_url)}
                  controls
                  className='w-full h-full'
                />
              </div>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className='space-y-6'>
          {/* Header */}
          <div>
            <div className='flex items-start justify-between mb-2'>
              <div className='flex-1'>
                <h1 className='text-3xl font-bold mb-2'>{listing.name}</h1>
                <div className='flex items-center gap-3 mb-3'>
                  <Badge
                    className={`${getAssetTypeColor(listing.asset_type)} flex items-center gap-1`}
                  >
                    {getAssetTypeIcon(listing.asset_type)}
                    {listing.asset_type_name}
                  </Badge>
                  {listing.is_auction && (
                    <Badge
                      variant='secondary'
                      className='text-green-600 bg-green-100'
                    >
                      <Clock className='w-3 h-3 mr-1' />
                      Live Auction
                    </Badge>
                  )}
                </div>
              </div>
              <div className='text-right'>
                <div className='text-2xl font-bold'>
                  {formatPrice(listing.price_wei)}
                </div>
                {listing.is_auction && listing.reserve_price_wei && (
                  <div className='text-sm text-muted-foreground'>
                    Reserve: {formatPrice(listing.reserve_price_wei)}
                  </div>
                )}
              </div>
            </div>

            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <div className='flex items-center gap-1'>
                <Hash className='w-4 h-4' />
                <span>Token #{listing.token_id}</span>
              </div>
              <div className='flex items-center gap-1'>
                <Package className='w-4 h-4' />
                <span>{listing.collection_name}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className='font-semibold mb-2'>Description</h3>
            <p className='text-muted-foreground'>{listing.description}</p>
          </div>

          {/* Purchase/Bid Section - Only show if not the seller */}
          {authenticated &&
          privyUser?.wallet?.address &&
          privyUser.wallet.address.toLowerCase() !==
            listing.seller_address.toLowerCase() ? (
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  {listing.is_auction ? (
                    <>
                      <Gavel className='w-5 h-5' />
                      Place a Bid
                    </>
                  ) : (
                    <>
                      <ShoppingCart className='w-5 h-5' />
                      Buy Now
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  {listing.is_auction
                    ? 'Place your bid for this auction item'
                    : 'Complete your purchase of this item'}
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
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

                <Button
                  onClick={listing.is_auction ? handlePlaceBid : handleBuyNow}
                  disabled={isProcessing}
                  className={`w-full ${
                    listing.is_auction
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-green-600 hover:bg-green-700'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                      Processing...
                    </>
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
              </CardContent>
            </Card>
          ) : authenticated &&
            privyUser?.wallet?.address &&
            privyUser.wallet.address.toLowerCase() ===
              listing.seller_address.toLowerCase() ? (
            /* Seller's Own Listing */
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='w-5 h-5' />
                  Your Listing
                </CardTitle>
                <CardDescription>
                  This is your listing. You cannot purchase your own item.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4'>
                  <p className='text-sm text-blue-600 dark:text-blue-400 mt-1'>
                    As the seller, you can manage this listing from your
                    profile.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* Not Connected */
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  {listing.is_auction ? (
                    <>
                      <Gavel className='w-5 h-5' />
                      Place a Bid
                    </>
                  ) : (
                    <>
                      <ShoppingCart className='w-5 h-5' />
                      Buy Now
                    </>
                  )}
                </CardTitle>
                <CardDescription>
                  Connect your wallet to{' '}
                  {listing.is_auction ? 'place a bid' : 'make a purchase'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 rounded-lg p-4'>
                  <div className='flex items-center gap-2 text-gray-600 dark:text-gray-400'>
                    <Package className='w-5 h-5' />
                    <span className='font-medium'>Connect Wallet Required</span>
                  </div>
                  <p className='text-sm text-gray-500 dark:text-gray-500 mt-1'>
                    Please connect your wallet to interact with this listing.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4 text-sm'>
                <div>
                  <span className='text-muted-foreground'>Contract</span>
                  <div className='font-mono'>
                    {formatAddress(listing.nft_contract)}
                  </div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Token ID</span>
                  <div className='font-mono'>#{listing.token_id}</div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Seller</span>
                  <div className='font-mono'>
                    {formatAddress(listing.seller_address)}
                  </div>
                </div>
                <div>
                  <span className='text-muted-foreground'>Listed</span>
                  <div>{new Date(listing.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* {listing.external_url && (
                <div>
                  <span className="text-muted-foreground">External Link</span>
                  <div>
                    <a
                      href={listing.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      {listing.external_url}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )} */}

              {listing.royalty_recipient && listing.royalty_bps > 0 && (
                <div>
                  <span className='text-muted-foreground'>Royalties</span>
                  <div className='flex items-center gap-2'>
                    <span>{listing.royalty_bps / 100}% to</span>
                    <span className='font-mono'>
                      {formatAddress(listing.royalty_recipient)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Attributes */}
          {listing.attributes && listing.attributes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Attributes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                  {listing.attributes.map((attr, index) => (
                    <div key={index} className='border rounded-lg p-3'>
                      <div className='text-sm text-muted-foreground'>
                        {attr.trait_type}
                      </div>
                      <div className='font-semibold'>{attr.value}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
