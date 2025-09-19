'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useListNft, type ListNftParams } from '@/hooks/use-list-nft';
import { formatPrice } from '@/lib/custom-utils';
import { Loader2, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface NftToBeListed {
  tokenId: number;
  contractAddress: string;
  name?: string;
  image?: string;
  description?: string;
}

interface ListNftFormProps {
  nft: NftToBeListed;
  onSuccess?: (listingId: bigint) => void;
  onCancel?: () => void;
  className?: string;
}

export const ListNftForm = ({
  nft,
  onSuccess,
  onCancel,
  className = '',
}: ListNftFormProps) => {
  const { listNft, isLoading, isPending, isSuccess, canList, isProcessing } =
    useListNft();

  const [price, setPrice] = useState('');
  const [enableCrossChain, setEnableCrossChain] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!price || parseFloat(price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    // Convert price to wei (assuming price is in ETH)
    const priceInWei = (parseFloat(price) * 1e18).toString();

    const params: ListNftParams = {
      nftContractAddr: nft.contractAddress,
      tokenId: nft.tokenId,
      price: priceInWei,
      enableCrossChain,
    };

    const result = await listNft(params);

    if (result.success && result.listingId) {
      onSuccess?.(result?.listingId);
    }
    if (isSuccess) {
      router.push(`/listing/${result?.listingId?.toString()}`);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  return (
    <div className={className}>
      <div>
        {/* NFT Preview */}
        <div className='max-w-[480px] mb-6 p-4 border rounded-lg'>
          <div className='flex items-center gap-4'>
            {nft.image && (
              <Image
                src={
                  nft.image.startsWith('ipfs://')
                    ? `https://ipfs.io/ipfs/${nft.image.replace('ipfs://', '')}`
                    : nft.image
                }
                width={64}
                height={64}
                alt={nft.name || `NFT #${nft.tokenId}`}
                className='w-16 h-16 object-cover rounded-lg'
              />
            )}
            <div className='flex-1'>
              <h4 className='font-semibold text-xl'>
                {nft.name || `NFT #${nft.tokenId}`}
              </h4>
              <p className='text-sm text-muted-foreground'>
                Token ID: {nft.tokenId}
              </p>
              <p className='text-sm text-muted-foreground'>
                Contract: {nft.contractAddress.slice(0, 6)}...
                {nft.contractAddress.slice(-4)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Price Input */}
          <div className='max-w-[480px]'>
            <div className='min-w-40 space-y-2'>
              <Label htmlFor='price'>Price (ETH)</Label>
              <Input
                id='price'
                type='number'
                step='0.001'
                min='0'
                placeholder='0.1'
                value={price}
                className='flex w-full min-w-0 flex-1 rounded-xl border h-14 p-[15px] pr-2 text-base font-normal leading-normal'
                onChange={e => setPrice(e.target.value)}
                disabled={isProcessing}
                required
              />
              {price && (
                <p className='text-sm text-muted-foreground'>
                  ≈ {formatPrice(parseFloat(price) * 1e18)}
                </p>
              )}
            </div>
          </div>

          {/* Cross-chain Option */}
          <div className='flex items-center space-x-2'>
            <input
              id='crosschain'
              type='checkbox'
              checked={enableCrossChain}
              onChange={e => setEnableCrossChain(e.target.checked)}
              disabled={true}
              className='rounded border-gray-300'
            />
            <Label htmlFor='crosschain' className='text-sm'>
              Enable cross-chain listing
            </Label>
          </div>
          {enableCrossChain && (
            <Badge variant='outline' className='text-xs'>
              This NFT will be available across multiple chains
            </Badge>
          )}

          {/* Action Buttons */}
          <div className='max-w-[480px]'>
            <div className='min-w-40 space-y-2'>
              <div className='flex gap-2 pt-4'>
                <Button
                  type='submit'
                  disabled={!canList || isProcessing}
                  className='flex-1'
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                      {isLoading
                        ? 'Preparing...'
                        : isPending
                          ? 'Listing...'
                          : 'Processing...'}
                    </>
                  ) : (
                    'List NFT'
                  )}
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCancel}
                  disabled={isProcessing}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </form>

        {/* Info */}
        <div className='max-w-[480px] mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
          <p className='text-sm text-blue-700'>
            <strong>Note:</strong> Listing an NFT will transfer it to the
            marketplace contract. You can cancel the listing at any time to get
            your NFT back.
          </p>
        </div>
      </div>
    </div>
  );
};
