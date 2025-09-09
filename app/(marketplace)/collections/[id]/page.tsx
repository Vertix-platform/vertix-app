import { Suspense } from 'react';
import {
  CollectionDetails,
  CollectionLoadingSkeleton,
} from './collection-details';

const CollectionPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
}) => {
  const { id } = await params;

  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <Suspense fallback={<CollectionLoadingSkeleton />}>
          <CollectionDetails id={id} />
        </Suspense>
      </section>
    </div>
  );
};

export default CollectionPage;
