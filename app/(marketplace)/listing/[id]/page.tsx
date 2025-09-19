import { Suspense } from 'react';
import { ListingDetails } from './listing-details';

const ListingPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <Suspense
          fallback={
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
          }
        >
          <ListingDetails listingId={id} />
        </Suspense>
      </section>
    </div>
  );
};

export default ListingPage;
