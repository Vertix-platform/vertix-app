'use client';

import { useState, useEffect } from 'react';
import { CollectionsGrid } from './collections/components/collections-grid';
import { CollectionsLoadingSkeleton } from './collections/components/loading-skeleton';
import { apiClient } from '@/lib/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { Collection } from '@/types/listings';

export default function ExplorePage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const response = await apiClient.getAllCollections();
        const data = response.data?.collections || [];
        setCollections(data);
      } catch (error) {
        console.error('Error loading collections preview:', error);
        setCollections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const renderCollectionsPreview = () => {
    if (loading) {
      return <CollectionsLoadingSkeleton />;
    }

    // Ensure collections is an array before slicing
    const collectionsArray = Array.isArray(collections) ? collections : [];

    // Only show first 4 collections as preview
    const previewCollections = collectionsArray.slice(0, 4);

    if (previewCollections.length === 0) {
      return null;
    }

    return (
      <div className=''>
        <div className='flex justify-between items-center'>
          <h2 className='text-2xl font-bold'>Featured Collections</h2>
          <Link href='/collections'>
            <Button variant='outline' size='sm' className='rounded-full'>
              View All Collections
              <ArrowRight className='h-4 w-4 ml-2' />
            </Button>
          </Link>
        </div>
        <CollectionsGrid collections={previewCollections} />
      </div>
    );
  };
  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <div className='text-left space-y-8'>
          <div className='space-y-4'>
            <h1 className='text-4xl 2xl:text-5xl font-bold'>
              Explore Digital Assets
            </h1>
            <p className='text-lg text-muted-foreground max-w-2xl'>
              Discover NFTs, social media accounts, domains, websites, and more
              on the premier cross-chain marketplace
            </p>
          </div>

          {renderCollectionsPreview()}
        </div>
      </section>
    </div>
  );
}
