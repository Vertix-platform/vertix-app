'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePrivy } from '@privy-io/react-auth';
import { Listing } from '@/hooks/use-listings';
import { CardBody, CardContainer, CardItem } from '../ui/3d-card';
import {
  Hash,
  ImageIcon,
  Users,
  Globe,
  FileText,
  Package,
  Link2,
  ShoppingCart,
  Gavel,
} from 'lucide-react';
import { formatPrice } from '@/lib/custom-utils';
import { Button } from '@/components/ui/button';
import { BuyModal } from './buy-modal';

interface ListingCardProps {
  listing: Listing;
}

export function ListingCard({ listing }: ListingCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user: privyUser, authenticated } = usePrivy();

  const handleBuyClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent Link navigation
    e.stopPropagation();
    setIsModalOpen(true);
  };

  const convertIpfsToHttp = (ipfsUrl: string) => {
    if (ipfsUrl.startsWith('ipfs://')) {
      const hash = ipfsUrl.replace('ipfs://', '');
      return `https://ipfs.io/ipfs/${hash}`;
    }
    return ipfsUrl;
  };

  const getAssetTypeIcon = (assetType: number) => {
    switch (assetType) {
      case 0: // NFT
        return <Package className='w-4 h-4' />;
      case 1: // Social Media
        return <Users className='w-4 h-4' />;
      case 2: // Website
        return <Globe className='w-4 h-4' />;
      case 3: // Domain
        return <Link2 className='w-4 h-4' />;
      case 4: // Digital Asset
        return <FileText className='w-4 h-4' />;
      default:
        return <Package className='w-4 h-4' />;
    }
  };

  const getAssetTypeColor = (assetType: number) => {
    switch (assetType) {
      case 0: // NFT
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 1: // Social Media
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 2: // Website
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 3: // Domain
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 4: // Digital Asset
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <>
      <CardContainer
        key={listing.listing_id}
        className='hover:shadow-lg transition-shadow bg-card text-card-foreground border rounded-xl min-w-full h-full group'
      >
        <CardBody className='relative group/card border-black/[0.1] h-fit py-0 p-2 flex flex-col justify-around'>
          <CardItem
            className={`min-w-full mb-2 ${listing.is_auction && 'flex items-center justify-between'}`}
          >
            {listing.is_auction && listing.auction_end_time && (
              <div className='text-green-600 flex items-center gap-1'>
                <span className='animate-caret-blink h-3 w-3 rounded-full bg-green-600' />
                <p className='text-sm'>Auction</p>
              </div>
            )}
            <div className={`${!listing.is_auction && 'flex justify-end'}`}>
              <div
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getAssetTypeColor(listing.asset_type)}`}
              >
                {getAssetTypeIcon(listing.asset_type)}
                {listing.asset_type_name}
              </div>
            </div>
          </CardItem>
          <Link
            href={`/listing/${listing.listing_id}`}
            key={listing.listing_id}
          >
            <CardItem translateZ='50' className='w-full'>
              {listing.image ? (
                <div className='w-full h-[200px] rounded-lg overflow-hidden'>
                  <Image
                    src={convertIpfsToHttp(listing.image)}
                    alt={listing.name}
                    width={100}
                    height={100}
                    className='w-full h-full object-cover'
                    unoptimized
                  />
                </div>
              ) : (
                <div className='w-full h-[200px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg'>
                  <ImageIcon className='w-12 h-12 text-gray-400' />
                </div>
              )}
            </CardItem>
          </Link>
          <div className='mt-4 flex-shrink-0'>
            <div className='flex justify-between items-center mb-2'>
              <CardItem className='text-lg font-semibold truncate'>
                {listing.name}
              </CardItem>
              <CardItem className='flex items-center gap-0.5 text-sm text-muted-foreground'>
                <Hash className='w-4 h-4' />
                {listing.token_id}
              </CardItem>
            </div>
            {/* Price and Buy Button */}
            <CardItem className='flex justify-between items-center w-full'>
              <div className='flex-1'>
                <p className='text-lg font-bold text-muted-foreground'>
                  {formatPrice(listing.price_wei)}
                </p>
              </div>
              {/* Hover Button - Only show if not the seller */}
              {/* {authenticated && privyUser?.wallet?.address && 
                           privyUser.wallet.address.toLowerCase() !== listing.seller_address.toLowerCase() && ( */}
              <div className='opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0'>
                <Button
                  onClick={handleBuyClick}
                  size='sm'
                  className={`bg-accent hover:bg-accent/50 text-white transition-all duration-200 shadow-lg hover:shadow-xl`}
                >
                  {listing.is_auction ? (
                    <>
                      <Gavel className='w-4 h-4 mr-1' />
                      Place Bid
                    </>
                  ) : (
                    <>
                      <ShoppingCart className='w-4 h-4 mr-1' />
                      Buy Now
                    </>
                  )}
                </Button>
              </div>
              {/* )} */}
            </CardItem>
          </div>
        </CardBody>
      </CardContainer>

      {/* Buy/Bid Modal */}
      <BuyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        listing={listing}
      />
    </>
  );
}
