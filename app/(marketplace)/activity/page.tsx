import { Suspense } from 'react';

const ActivityPage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className='min-h-screen'>
        <section className='container mx-auto px-4 py-8'>
          <div className='text-left space-y-4'>
            <h1 className='text-4xl 2xl:text-5xl font-bold'>Activity</h1>
            <p className='text-lg text-muted-foreground max-w-2xl'>
              View your recent activity on the platform
            </p>
          </div>
        </section>
      </div>
    </Suspense>
  );
};

export default ActivityPage;
