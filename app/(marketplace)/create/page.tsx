import { Suspense } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileImage, Globe, Plus } from 'lucide-react';

const CreatePage = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className='min-h-screen'>
        <section className='container mx-auto px-4 py-8'>
          <div className='text-left space-y-4 mb-8'>
            <h1 className='text-4xl 2xl:text-5xl font-bold'>Create</h1>
            <p className='text-lg text-muted-foreground max-w-2xl'>
              Create new digital assets and listings on the platform
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {/* Create NFTs */}
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-center space-x-2'>
                  <FileImage className='h-6 w-6 text-blue-500' />
                  <CardTitle>Create NFTs</CardTitle>
                </div>
                <CardDescription>
                  Create and create new NFTs on the blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-4'>
                  Mint basic NFTs, social media NFTs, or add to collections.
                </p>
                <Link href='/create/nft'>
                  <Button className='w-full'>Start Creating NFTs</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Create Collection */}
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-center space-x-2'>
                  <Globe className='h-6 w-6 text-purple-500' />
                  <CardTitle>Create Collection</CardTitle>
                </div>
                <CardDescription>
                  Organize your NFTs into collections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-4'>
                  Create collections to group related NFTs together.
                </p>
                <Link href='/create/create-collection'>
                  <Button className='w-full'>Create Collection</Button>
                </Link>
              </CardContent>
            </Card>

            {/* List Asset */}
            <Card className='hover:shadow-lg transition-shadow'>
              <CardHeader>
                <div className='flex items-center space-x-2'>
                  <Plus className='h-6 w-6 text-green-500' />
                  <CardTitle>List Asset</CardTitle>
                </div>
                <CardDescription>
                  List existing NFTs or digital assets for sale
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className='text-sm text-muted-foreground mb-4'>
                  List your NFTs, social media accounts, or other digital
                  assets.
                </p>
                <Link href='/listings'>
                  <Button className='w-full'>List Asset</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </Suspense>
  );
};

export default CreatePage;
