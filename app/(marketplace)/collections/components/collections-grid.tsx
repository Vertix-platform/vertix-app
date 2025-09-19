'use client';

import { Button } from '@/components/ui/button';
import { Image as ImageIcon, Hash } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Collection } from '@/types/listings';
import { useState } from 'react';
import { CardBody, CardContainer, CardItem } from '@/components/ui/3d-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CollectionsGridProps {
  collections: Collection[];
}

// Multiple IPFS gateways for fallback
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

export function CollectionsGrid({ collections }: CollectionsGridProps) {
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (collectionId: number) => {
    setImageErrors(prev => ({ ...prev, [collectionId]: true }));
  };

  const getImageUrl = (ipfsHash: string, collectionId: number) => {
    if (imageErrors[collectionId]) {
      // If image failed to load, try next gateway
      const currentIndex = IPFS_GATEWAYS.findIndex(gateway =>
        ipfsHash.includes(gateway.replace('https://', '').replace('/ipfs/', ''))
      );
      const nextIndex = (currentIndex + 1) % IPFS_GATEWAYS.length;
      return IPFS_GATEWAYS[nextIndex] + ipfsHash.replace('ipfs://', '');
    }
    return IPFS_GATEWAYS[0] + ipfsHash.replace('ipfs://', '');
  };

  if (collections.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <ImageIcon className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>
          No collections yet
        </h3>
        <p className='text-gray-500 mb-6'>
          Be the first to create a collection on the platform!
        </p>
        <Link href='/create/create-collection'>
          <Button size='lg'>Create Your First Collection</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
      {collections.map(collection => (
        <Link
          href={`/collections/${collection.collection_id}`}
          key={collection.collection_id}
        >
          <CardContainer
            key={collection.collection_id}
            className='hover:shadow-lg transition-shadow bg-card text-card-foreground border rounded-xl h-full min-w-full'
          >
            <CardBody className='relative group/card border-black/[0.1] h-full rounded-xl p-2 border'>
              <CardItem translateZ='100' className='w-full'>
                {collection.image && !imageErrors[collection.collection_id] ? (
                  <div className='w-full h-[200px] rounded-lg overflow-hidden'>
                    <Image
                      src={getImageUrl(
                        collection.image,
                        collection.collection_id
                      )}
                      alt={collection.name}
                      width={100}
                      height={100}
                      className='w-full h-full object-cover'
                      unoptimized
                      onError={() => handleImageError(collection.collection_id)}
                    />
                  </div>
                ) : (
                  <div className='w-full h-[200px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
                    <ImageIcon className='w-12 h-12 text-gray-400' />
                  </div>
                )}
              </CardItem>
              <div className='mt-4'>
                <div className='flex justify-between items-center'>
                  <CardItem className='text-xl'>{collection.name}</CardItem>
                  <CardItem className='flex items-center gap-0.5'>
                    <Hash className='w-4 h-4' />
                    {collection.collection_id}
                  </CardItem>
                </div>
                <CardItem className='flex items-center justify-between gap-1.5 text-sm mt-2'>
                  <Avatar>
                    <AvatarImage src={''} alt={collection.creator} />
                    <AvatarFallback>
                      {collection.creator.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <p
                    className='font-mono text-xs truncate'
                    title={collection.creator}
                  >
                    {collection.creator.slice(0, 6)}...
                    {collection.creator.slice(-4)}
                  </p>
                </CardItem>
              </div>
            </CardBody>
          </CardContainer>
        </Link>
      ))}
    </div>
  );
}
