import { Suspense } from 'react';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { MintToCollectionForm } from './components/mint-to-collection-form';
import { getCollections } from '@/lib/server-actions';

import { MintToCollectionLoadingSkeleton } from './components/loading-skeleton';
import { ErrorDisplay } from './components/error-display';

// Error boundary component for collections fetching
async function CollectionsData() {
  try {
    const collections = await getCollections();

    if (collections.length === 0) {
      return (
        <div className='text-center py-12'>
          <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <svg
              className='w-12 h-12 text-gray-400'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
              />
            </svg>
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-2'>
            No collections yet
          </h3>
          <p className='text-gray-500 mb-6'>
            Be the first to create a collection on the platform!
          </p>
          <a
            href='/create/collection'
            className='inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          >
            Create Collection
          </a>
        </div>
      );
    }

    return <MintToCollectionForm collections={collections} />;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    return (
      <ErrorDisplay
        error={errorMessage}
        onRetry={() => window.location.reload()}
      />
    );
  }
}

export default async function MintToCollectionPage() {
  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <PageBreadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Create', href: '/create' },
                { label: 'Mint to Collection' },
              ]}
              className='mb-4'
            />
            <div>
              <h1 className='text-3xl font-bold'>Mint to Collection</h1>
              <p className='text-muted-foreground'>
                Add NFTs to your existing collections with automatic IPFS upload
                and metadata generation.
              </p>
            </div>
          </div>

          <Suspense fallback={<MintToCollectionLoadingSkeleton />}>
            <CollectionsData />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
