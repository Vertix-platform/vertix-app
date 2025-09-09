'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CollectionsGrid } from './components/collections-grid';
import { CollectionsLoadingSkeleton } from './components/loading-skeleton';
import { apiClient } from '@/lib/api';
import type { Collection } from '@/types/listings';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getAllCollections();
        const data = response.data || [];
        setCollections(data);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    // Trigger re-fetch
    window.location.reload();
  };
  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <div className='text-left space-y-6'>
          <div className='flex justify-between items-start'>
            <div>
              <h1 className='text-4xl 2xl:text-5xl font-bold'>Collections</h1>
              <p className='text-lg text-muted-foreground max-w-2xl'>
                Discover and explore NFT collections on the platform
              </p>
            </div>
            <Link href='/create/collection'>
              <Button>
                <Plus className='h-4 w-4 mr-2' />
                Create Collection
              </Button>
            </Link>
          </div>

          {loading ? (
            <CollectionsLoadingSkeleton />
          ) : error ? (
            <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
              <p className='text-red-800'>Error: {error}</p>
              <Button
                variant='outline'
                size='sm'
                onClick={handleRetry}
                className='mt-2'
              >
                Retry
              </Button>
            </div>
          ) : (
            <CollectionsGrid collections={collections} />
          )}
        </div>
      </section>
    </div>
  );
}
