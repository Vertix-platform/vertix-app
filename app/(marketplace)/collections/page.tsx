'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { CollectionsGrid } from './components/collections-grid';
import { CollectionsLoadingSkeleton } from './components/loading-skeleton';
import { Pagination } from '@/components/ui/pagination';
import { apiClient } from '@/lib/api';
import type { Collection } from '@/types/listings';

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20; // Load 20 collections per page

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        setError(null);
        const offset = (currentPage - 1) * limit;
        const response = await apiClient.getAllCollections(limit, offset);

        if (response.success && response.data) {
          const { collections, total_count } = response.data;
          setCollections(collections);
          setTotalPages(Math.ceil(total_count / limit));
        } else {
          setError(response.error || 'Failed to fetch collections');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, [currentPage]);

  const handleRetry = () => {
    setError(null);
    setCurrentPage(1);
    setCollections([]);
    setTotalPages(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
            <Link href='/create/create-collection'>
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
            <>
              <CollectionsGrid collections={collections} />

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                loading={loading}
                className='mt-8'
              />
            </>
          )}
        </div>
      </section>
    </div>
  );
}
