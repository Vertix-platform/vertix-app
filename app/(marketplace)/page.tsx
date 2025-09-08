import { Suspense } from 'react';
import { CollectionsGrid } from './collections/components/collections-grid';
import { CollectionsLoadingSkeleton } from './collections/components/loading-skeleton';
import { getCollections } from '@/lib/server-actions';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

async function CollectionsPreview() {
  try {
    const collections = await getCollections();

    // Only show first 3 collections as preview
    const previewCollections = collections.slice(0, 4);

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
  } catch (error) {
    console.error('Error loading collections preview:', error);
    return null;
  }
}

export default function ExplorePage() {
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

          <Suspense fallback={<CollectionsLoadingSkeleton />}>
            <CollectionsPreview />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
