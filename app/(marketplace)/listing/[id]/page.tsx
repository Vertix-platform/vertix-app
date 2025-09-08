import { Suspense } from 'react';

const ListingPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className='min-h-screen'>
        <section className='container mx-auto px-4 py-8'>
          <div className='text-left space-y-4'>
            <h1 className='text-4xl 2xl:text-5xl font-bold'>Listing {id}</h1>
            <p className='text-lg text-muted-foreground max-w-2xl'>
              View listing details and purchase
            </p>
          </div>
        </section>
      </div>
    </Suspense>
  );
};

export default ListingPage;
