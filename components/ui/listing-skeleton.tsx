'use client';

import React from 'react';
import { CardBody, CardContainer, CardItem } from './3d-card';

export function ListingSkeleton() {
  return (
    <CardContainer className='hover:shadow-lg transition-shadow bg-card text-card-foreground border rounded-xl min-w-full h-full animate-pulse'>
      <CardBody className='relative group/card border-black/[0.1] h-fit py-0 p-2 flex flex-col justify-around'>
        {/* Top Section - Asset Type Badge */}
        <CardItem className='min-w-full mb-2 flex items-center justify-end'>
          <div className='flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700'>
            <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded'></div>
            <div className='h-3 bg-gray-300 dark:bg-gray-600 rounded w-16'></div>
          </div>
        </CardItem>

        {/* Image Section */}
        <CardItem translateZ='50' className='w-full'>
          <div className='w-full h-[200px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg'></div>
        </CardItem>

        {/* Content Section */}
        <div className='mt-4 flex-shrink-0'>
          {/* Name and Token ID */}
          <div className='flex justify-between items-center mb-2'>
            <CardItem className='text-lg font-semibold'>
              <div className='h-5 bg-gray-300 dark:bg-gray-600 rounded w-32'></div>
            </CardItem>
            <CardItem className='flex items-center gap-0.5 text-sm text-muted-foreground'>
              <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded'></div>
              <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-8'></div>
            </CardItem>
          </div>

          {/* Price Section */}
          <CardItem className='flex justify-between items-center w-full'>
            <div className='flex-1'>
              <div className='h-6 bg-gray-300 dark:bg-gray-600 rounded w-20'></div>
            </div>
            {/* Button skeleton (hidden by default, shown on hover) */}
            <div className='opacity-0'>
              <div className='h-8 bg-gray-300 dark:bg-gray-600 rounded w-24'></div>
            </div>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}

// Variant with auction indicator
export function ListingSkeletonAuction() {
  return (
    <CardContainer className='hover:shadow-lg transition-shadow bg-card text-card-foreground border rounded-xl min-w-full h-full animate-pulse'>
      <CardBody className='relative group/card border-black/[0.1] h-fit py-0 p-2 flex flex-col justify-around'>
        {/* Top Section - Auction Indicator + Asset Type Badge */}
        <CardItem className='min-w-full mb-2 flex items-center justify-between'>
          {/* Auction Indicator */}
          <div className='text-green-600 flex items-center gap-1'>
            <div className='h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600'></div>
            <div className='h-3 bg-gray-300 dark:bg-gray-600 rounded w-16'></div>
          </div>
          {/* Asset Type Badge */}
          <div className='flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700'>
            <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded'></div>
            <div className='h-3 bg-gray-300 dark:bg-gray-600 rounded w-16'></div>
          </div>
        </CardItem>

        {/* Image Section */}
        <CardItem translateZ='50' className='w-full'>
          <div className='w-full h-[200px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg'></div>
        </CardItem>

        {/* Content Section */}
        <div className='mt-4 flex-shrink-0'>
          {/* Name and Token ID */}
          <div className='flex justify-between items-center mb-2'>
            <CardItem className='text-lg font-semibold'>
              <div className='h-5 bg-gray-300 dark:bg-gray-600 rounded w-32'></div>
            </CardItem>
            <CardItem className='flex items-center gap-0.5 text-sm text-muted-foreground'>
              <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded'></div>
              <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-8'></div>
            </CardItem>
          </div>

          {/* Price Section */}
          <CardItem className='flex justify-between items-center w-full'>
            <div className='flex-1'>
              <div className='h-6 bg-gray-300 dark:bg-gray-600 rounded w-20'></div>
            </div>
            {/* Button skeleton (hidden by default, shown on hover) */}
            <div className='opacity-0'>
              <div className='h-8 bg-gray-300 dark:bg-gray-600 rounded w-24'></div>
            </div>
          </CardItem>
        </div>
      </CardBody>
    </CardContainer>
  );
}

// Mint NFT Card Skeleton
export function MintNftCardSkeleton() {
  return (
    <CardContainer className='hover:shadow-lg transition-shadow bg-card text-card-foreground border rounded-xl min-w-full h-full animate-pulse'>
      <CardBody className='relative group/card border-black/[0.1] h-fit py-0 p-2 flex flex-col justify-around'>
        {/* Image Section */}
        <CardItem translateZ='100' className='w-full'>
          <div className='w-full h-[200px] bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg'></div>
        </CardItem>

        {/* Content Section */}
        <div className='mt-4 flex-shrink-0'>
          {/* Name and Token ID */}
          <div className='flex justify-between items-center'>
            <CardItem className='text-lg font-semibold'>
              <div className='h-5 bg-gray-300 dark:bg-gray-600 rounded w-32'></div>
            </CardItem>
            <CardItem className='flex items-center gap-0.5 text-sm text-muted-foreground'>
              <div className='w-4 h-4 bg-gray-300 dark:bg-gray-600 rounded'></div>
              <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-8'></div>
            </CardItem>
          </div>

          {/* Collection Name and Listed Status */}
          <div className='flex justify-between items-center'>
            <CardItem className='text-sm text-muted-foreground'>
              <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-24'></div>
            </CardItem>
            {/* Listed status skeleton (sometimes shown) */}
            <div className='h-4 bg-gray-300 dark:bg-gray-600 rounded w-12'></div>
          </div>
        </div>
      </CardBody>
    </CardContainer>
  );
}

export function MintNftCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {Array.from({ length: count }).map((_, index) => (
        <MintNftCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ListingSkeletonGrid({ count = 12 }: { count?: number }) {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
      {Array.from({ length: count }).map((_, index) =>
        // Mix regular and auction skeletons for variety
        index % 3 === 0 ? (
          <ListingSkeletonAuction key={index} />
        ) : (
          <ListingSkeleton key={index} />
        )
      )}
    </div>
  );
}
