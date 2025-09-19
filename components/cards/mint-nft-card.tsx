import React from 'react';
import { CardBody, CardContainer, CardItem } from '../ui/3d-card';
import Link from 'next/link';
import { Hash, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { UserNft } from '@/hooks/use-user-nfts';

interface MintNftCardProps {
  nft: UserNft;
}

export const MintNftCard = ({ nft }: MintNftCardProps) => {
  return (
    <Link href={`/create/list-asset/${nft.token_id}`} key={nft.id}>
      <CardContainer
        key={nft.id}
        className='hover:shadow-lg transition-shadow bg-card text-card-foreground border rounded-xl min-w-full h-full'
      >
        <CardBody className='relative group/card border-black/[0.1] h-fit py-0 p-2 flex flex-col justify-around'>
          <CardItem translateZ='100' className='w-full'>
            {nft.image ? (
              <div className='w-full h-[200px] rounded-lg overflow-hidden'>
                <Image
                  src={
                    nft.image.startsWith('ipfs://')
                      ? `https://ipfs.io/ipfs/${nft.image.replace('ipfs://', '')}`
                      : nft.image || '/images/nft-placeholder.png'
                  }
                  alt={nft.name}
                  width={100}
                  height={100}
                  className='w-full h-full object-cover'
                  unoptimized
                />
              </div>
            ) : (
              <div className='w-full h-[200px] flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg'>
                <ImageIcon className='w-12 h-12 text-gray-400' />
              </div>
            )}
          </CardItem>
          <div className='mt-4 flex-shrink-0'>
            <div className='flex justify-between items-center'>
              <CardItem className='text-lg font-semibold truncate'>
                {nft.name}
              </CardItem>
              <CardItem className='flex items-center gap-0.5 text-sm text-muted-foreground'>
                <Hash className='w-4 h-4' />
                {nft.token_id}
              </CardItem>
            </div>
            <div className='flex justify-between items-center'>
              <CardItem className='text-sm text-muted-foreground'>
                {nft.collection_name}
              </CardItem>
              {nft.is_listed && (
                <div>
                  <CardItem className='text-sm text-green-600 font-medium'>
                    Listed
                  </CardItem>
                </div>
              )}
            </div>
          </div>
        </CardBody>
      </CardContainer>
    </Link>
  );
};
