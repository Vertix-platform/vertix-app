'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Image as ImageIcon,
  Hash,
  User,
  Package,
  ExternalLink,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Collection } from '@/types/listings';

// Multiple IPFS gateways for fallback
const IPFS_GATEWAYS = [
  'https://gateway.pinata.cloud/ipfs/',
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

export const CollectionLoadingSkeleton = () => (
  <div className='space-y-8'>
    <div className='animate-pulse'>
      <div className='h-12 bg-gray-200 rounded w-1/3 mb-4'></div>
      <div className='h-6 bg-gray-200 rounded w-1/2'></div>
    </div>
    <div className='flex flex-col lg:flex-row gap-8'>
      <div className='lg:w-1/3'>
        <div className='aspect-square bg-gray-200 rounded-lg'></div>
      </div>
      <div className='lg:w-2/3 space-y-6'>
        <div className='space-y-4'>
          <div className='h-8 bg-gray-200 rounded w-1/2'></div>
          <div className='h-6 bg-gray-200 rounded w-3/4'></div>
        </div>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <div key={i} className='h-20 bg-gray-200 rounded'></div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export function CollectionDetails({ id }: { id: string }) {
  const [collection, setCollection] = useState<Collection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAllCollections();
        const collections = response.data || [];
        const foundCollection = collections.find(
          c => c.collection_id.toString() === id
        );

        if (!foundCollection) {
          setError('Collection not found');
          return;
        }

        setCollection(foundCollection);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCollection();
  }, [id]);

  if (loading) {
    return <CollectionLoadingSkeleton />;
  }

  if (error || !collection) {
    return (
      <div className='text-center py-12'>
        <h2 className='text-2xl font-bold mb-4'>Collection Not Found</h2>
        <p className='text-muted-foreground mb-6'>
          {error || 'The collection you are looking for does not exist.'}
        </p>
        <Button onClick={() => router.push('/collections')}>
          Back to Collections
        </Button>
      </div>
    );
  }

  const imageUrl = collection.image
    ? IPFS_GATEWAYS[0] + collection.image.replace('ipfs://', '')
    : null;

  return (
    <div className='space-y-8'>
      <div className='flex flex-col lg:flex-row gap-8'>
        <div className='lg:w-1/3'>
          <div className='aspect-square bg-gray-100 rounded-lg overflow-hidden'>
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={collection.name}
                width={400}
                height={400}
                className='w-full h-full object-cover'
                unoptimized
              />
            ) : (
              <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100'>
                <ImageIcon className='w-24 h-24 text-gray-400' />
              </div>
            )}
          </div>
        </div>

        <div className='lg:w-2/3 space-y-6'>
          <div>
            <h1 className='text-4xl font-bold mb-2'>{collection.name}</h1>
            <div className='flex items-center gap-3 mb-4'>
              <Badge variant='secondary' className='text-lg px-3 py-1'>
                <Hash className='w-4 h-4 mr-2' />
                {collection.symbol}
              </Badge>
              <Badge variant='outline'>
                {collection.chain_id === 84532
                  ? 'Base Sepolia'
                  : `Chain ${collection.chain_id}`}
              </Badge>
            </div>
            <p className='text-muted-foreground text-lg'>
              A unique NFT collection with {collection.max_supply} total supply
            </p>
          </div>

          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>
                  Collection ID
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>
                  #{collection.collection_id}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>
                  Current Supply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>
                  {collection.current_supply}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>
                  Max Supply
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>{collection.max_supply}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className='pb-2'>
                <CardTitle className='text-sm text-muted-foreground'>
                  Available
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-2xl font-bold'>
                  {collection.max_supply - collection.current_supply}
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <User className='w-5 h-5' />
                Creator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='flex items-center justify-between'>
                <code className='text-sm bg-muted px-3 py-2 rounded'>
                  {collection.creator}
                </code>
                <Link href={`/creators/${collection.creator}`}>
                  <Button variant='outline' size='sm'>
                    <ExternalLink className='w-4 h-4 mr-2' />
                    View Profile
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className='flex gap-4'>
            <Link
              href={`/create/nft-collection?collection_id=${collection.collection_id}`}
            >
              <Button size='lg' className='flex-1'>
                <Package className='w-5 h-5 mr-2' />
                Mint NFT to Collection
              </Button>
            </Link>
            <Link href='/collections'>
              <Button variant='outline' size='lg'>
                Back to Collections
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>NFTs in Collection</CardTitle>
          <CardDescription>
            {collection.current_supply === 0
              ? 'No NFTs have been minted to this collection yet.'
              : `${collection.current_supply} NFTs available in this collection.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {collection.current_supply === 0 ? (
            <div className='text-center py-8'>
              <Package className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
              <p className='text-muted-foreground mb-4'>
                Be the first to mint an NFT to this collection!
              </p>
              <Link
                href={`/create/nft-collection?collection_id=${collection.collection_id}`}
              >
                <Button>Mint First NFT</Button>
              </Link>
            </div>
          ) : (
            <div className='text-center py-8'>
              <p className='text-muted-foreground'>
                NFT display component coming soon...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
