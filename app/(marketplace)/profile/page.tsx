import { Suspense } from 'react';

const ProfilePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className='min-h-screen'>
        <section className='container mx-auto px-4 py-8'>
          <div className='text-left space-y-4'>
            <h1 className='text-4xl 2xl:text-5xl font-bold'>Profile</h1>
            <p className='text-lg text-muted-foreground max-w-2xl'>
              View your profile and settings
            </p>
          </div>
        </section>
      </div>
    </Suspense>
  );
};

export default ProfilePage;
