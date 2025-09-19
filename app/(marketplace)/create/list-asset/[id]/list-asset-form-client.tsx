'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  ListNftForm,
  type NftToBeListed,
} from '@/components/cards/list-nft-form';
import {
  ChainId,
  getContractAddress,
  isSupportedChain,
} from '@/lib/contracts/addresses';
import { useChainId } from 'wagmi';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useUserNfts } from '@/hooks/use-user-nfts';
import { usePrivy } from '@privy-io/react-auth';
import { supportedChains } from '@/lib/wagmi/config';

interface ListAssetFormClientProps {
  tokenId: string;
}

export function ListAssetFormClient({ tokenId }: ListAssetFormClientProps) {
  const { authenticated, user: privyUser } = usePrivy();
  const chainId = useChainId();
  const router = useRouter();
  const { nfts, isLoading: isLoadingNfts, error: nftsError } = useUserNfts();

  const [nft, setNft] = useState<NftToBeListed | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNftData = async () => {
      if (
        !authenticated ||
        !privyUser?.wallet?.address ||
        isLoadingNfts ||
        nfts.length === 0
      ) {
        return;
      }

      try {
        // Find the NFT in the user's NFTs
        const foundNft = nfts.find(n => n.token_id === parseInt(tokenId));

        if (!foundNft) {
          console.error(
            'NFT not found. Available token IDs:',
            nfts.map(n => n.token_id)
          );
          toast.error(
            `NFT with token ID ${tokenId} not found in your collection`
          );
          router.push('/create/list-asset');
          return;
        }

        if (foundNft.is_listed) {
          toast.error('This NFT is already listed for sale');
          router.push('/create/list-asset');
          return;
        }

        // Get the VertixNFT contract address for the current chain
        const nftContractAddress = getContractAddress(
          chainId as ChainId,
          'VertixNFT'
        );

        const nftToBeListed: NftToBeListed = {
          tokenId: foundNft.token_id,
          contractAddress: nftContractAddress,
          name: foundNft.name,
          image: foundNft.image,
          description: foundNft.description,
        };

        setNft(nftToBeListed);
      } catch (error) {
        console.error('Error fetching NFT:', error);
        toast.error('Failed to fetch NFT details');
        router.push('/create/list-asset');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNftData();
  }, [
    authenticated,
    privyUser?.wallet?.address,
    isLoadingNfts,
    nfts,
    tokenId,
    chainId,
    router,
  ]);

  const handleListingSuccess = (listingId: bigint) => {
    toast.success(
      `NFT listed successfully! Listing ID: ${listingId.toString()}`
    );
    router.push(`/marketplace/listing/${listingId.toString()}`);
  };

  const handleCancel = () => {
    router.push('/create/list-asset');
  };

  if (!authenticated || !privyUser?.wallet?.address) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <div className='p-8 text-center'>
          <h2 className='text-2xl font-bold mb-4'>Connect Your Wallet</h2>
          <p className='text-muted-foreground mb-6'>
            Please connect your wallet to list NFTs for sale.
          </p>
          <Button onClick={() => router.push('/login')}>Connect Wallet</Button>
        </div>
      </div>
    );
  }

  if (isLoading || isLoadingNfts) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p className='text-muted-foreground'>Loading NFT details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (nftsError) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center py-8'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <p className='text-red-500 mb-4'>Error loading NFTs: {nftsError}</p>
          <Button
            onClick={() => router.push('/create/list-asset')}
            variant='outline'
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (!nft) {
    return (
      <div className='container mx-auto px-4 py-8'>
        <div className='text-center py-8'>
          <AlertCircle className='h-12 w-12 text-red-500 mx-auto mb-4' />
          <p className='text-red-500 mb-4'>NFT not found or already listed</p>
          <Button
            onClick={() => router.push('/create/list-asset')}
            variant='outline'
          >
            Go Back
          </Button>
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
            onClick={() => router.push('/create/list-asset')}
            className='mb-4'
          >
            <ArrowLeft className='h-4 w-4 mr-2' />
            Back to NFT Selection
          </Button>
          <h1 className='text-3xl font-bold'>List NFT for Sale</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            Set the price and list your NFT on the marketplace.
          </p>

          {/* Wallet & Network Info */}
          <div className='space-y-3 mt-4'>
            <div className='text-sm font-medium mb-1'>Connected Wallet:</div>
            <div className='text-sm text-muted-foreground font-mono'>
              {privyUser?.wallet?.address}
            </div>
            <div>
              <div className='flex items-center space-x-2'>
                {isSupportedChain(chainId) ? (
                  <>
                    <div className='w-2 h-2 bg-green-500 rounded-full' />
                    <span className='text-sm font-medium text-green-800 dark:text-green-200'>
                      Network Supported
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className='w-4 h-4 text-red-600' />
                    <span className='text-sm font-medium text-red-800 dark:text-red-200'>
                      Unsupported Network
                    </span>
                  </>
                )}
              </div>
              <div className='text-xs text-muted-foreground mt-1'>
                {isSupportedChain(chainId)
                  ? `Chain ID: ${chainId}`
                  : `Please switch to: ${supportedChains.map(c => c.name).join(', ')}`}
              </div>
            </div>
          </div>
        </div>

        {/* List NFT Form */}
        <ListNftForm
          nft={nft}
          onSuccess={handleListingSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
