'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';
import { useUserNfts } from '@/hooks/use-user-nfts';
import { usePrivy } from '@privy-io/react-auth';
import Link from 'next/link';
import { MintNftCard } from '@/components/cards/mint-nft-card';

export default function ListAssetPage() {
  const { authenticated, user: privyUser, login } = usePrivy();
  const router = useRouter();
  const { nfts, isLoading: isLoadingNfts, error: nftsError } = useUserNfts();

  if (!authenticated || !privyUser?.wallet?.address) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div>
          <div className='p-8 text-center'>
            <h2 className='text-2xl font-bold mb-4'>Connect Your Wallet</h2>
            <p className='text-muted-foreground mb-6'>
              Please connect your wallet to list NFTs for sale.
            </p>
            <Button onClick={() => login()}>Connect Wallet</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div>
        {/* Header */}
        <div className='mb-8'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='mb-4'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back
          </Button>
          <h1 className='text-3xl font-bold'>List NFT for Sale</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            List your NFT on the marketplace and set your desired price.
          </p>
        </div>

        {/* User's NFTs */}
        <section className='mt-6'>
          <div className='space-y-4'>
            {isLoadingNfts ? (
              <div className='text-center py-8'>
                <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto'></div>
                <p className='text-muted-foreground mt-2'>
                  Loading your NFTs...
                </p>
              </div>
            ) : nftsError ? (
              <div className='text-center py-8'>
                <p className='text-red-500'>Error loading NFTs: {nftsError}</p>
              </div>
            ) : nfts.length === 0 ? (
              <div className='text-center py-8'>
                <Package className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-muted-foreground mb-4'>
                  No NFTs found in your collection.
                </p>
                <p className='text-sm text-muted-foreground mb-4'>
                  You need to mint NFTs first before you can list them for sale.
                </p>
                <Link href='/create/nft'>
                  <Button asChild variant='outline'>
                    Create NFTs
                  </Button>
                </Link>
              </div>
            ) : (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                {nfts.map(nft => (
                  <MintNftCard key={nft.id} nft={nft} />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
