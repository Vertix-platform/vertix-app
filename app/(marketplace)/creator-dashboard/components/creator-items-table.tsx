'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Eye,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus,
  TrendingUp,
  DollarSign,
} from 'lucide-react';
import Image from 'next/image';
import { formatDate, formatPrice } from '@/lib/custom-utils';
import Link from 'next/link';

interface CreatorNFT {
  id: string;
  tokenId: number;
  name: string;
  image: string;
  description: string;
  collectionId?: number;
  collectionName?: string;
  isListed: boolean;
  listingPrice?: number;
  listingId?: number;
  mintedAt: string;
  metadataUri: string;
}

interface CreatorItemsTableProps {
  walletAddress: string;
}

const ITEMS_PER_PAGE = 10;

export function CreatorItemsTable({ walletAddress }: CreatorItemsTableProps) {
  const [nfts, setNfts] = useState<CreatorNFT[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchNFTs = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call to fetch user's NFTs
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for now
        const mockNFTs: CreatorNFT[] = [
          {
            id: '1',
            tokenId: 1,
            name: 'Cool NFT #1',
            image: '/images/nft-placeholder.png',
            description: 'A really cool NFT',
            collectionId: 1,
            collectionName: 'Cool Collection',
            isListed: true,
            listingPrice: 0.5,
            listingId: 101,
            mintedAt: '2024-01-15T10:30:00Z',
            metadataUri: 'ipfs://QmExample1',
          },
          {
            id: '2',
            tokenId: 2,
            name: 'Awesome Art #2',
            image: '/images/nft-placeholder.png',
            description: 'Awesome digital art',
            isListed: false,
            mintedAt: '2024-01-14T15:45:00Z',
            metadataUri: 'ipfs://QmExample2',
          },
          {
            id: '3',
            tokenId: 3,
            name: 'Digital Masterpiece #3',
            image: '/images/nft-placeholder.png',
            description: 'A digital masterpiece',
            collectionId: 1,
            collectionName: 'Cool Collection',
            isListed: true,
            listingPrice: 1.2,
            listingId: 102,
            mintedAt: '2024-01-13T09:15:00Z',
            metadataUri: 'ipfs://QmExample3',
          },
        ];

        setNfts(mockNFTs);
        setTotalItems(mockNFTs.length);
        setTotalPages(Math.ceil(mockNFTs.length / ITEMS_PER_PAGE));
      } catch (error) {
        console.error('Failed to fetch NFTs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [walletAddress, currentPage]);

  const handleListNFT = (nft: CreatorNFT) => {
    // TODO: Implement listing functionality
    console.log('List NFT:', nft);
  };

  const handleUnlistNFT = (nft: CreatorNFT) => {
    // TODO: Implement unlisting functionality
    console.log('Unlist NFT:', nft);
  };

  const handleViewNFT = (nft: CreatorNFT) => {
    // TODO: Navigate to NFT detail page
    console.log('View NFT:', nft);
  };

  const getStatusBadge = (nft: CreatorNFT) => {
    if (nft.isListed) {
      return (
        <Badge
          variant='default'
          className='bg-green-100 text-green-800 border-green-200'
        >
          <TrendingUp className='h-3 w-3 mr-1' />
          Listed
        </Badge>
      );
    }
    return <Badge variant='secondary'>Unlisted</Badge>;
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-8 w-48' />
          <Skeleton className='h-10 w-32' />
        </div>
        <div className='border rounded-lg'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>NFT</TableHead>
                <TableHead>Collection</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Minted</TableHead>
                <TableHead className='w-[100px]'>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className='flex items-center space-x-3'>
                      <Skeleton className='h-12 w-12 rounded' />
                      <div className='space-y-1'>
                        <Skeleton className='h-4 w-24' />
                        <Skeleton className='h-3 w-16' />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-16' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-6 w-16' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-4 w-20' />
                  </TableCell>
                  <TableCell>
                    <Skeleton className='h-8 w-8' />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className='text-center py-12'>
        <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <Plus className='w-12 h-12 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>No NFTs yet</h3>
        <p className='text-gray-500 mb-6'>
          Create your first NFT to get started!
        </p>
        <Button asChild>
          <Link href='/create'>
            <Plus className='h-4 w-4 mr-2' />
            Create NFT
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-lg font-semibold'>My NFTs ({totalItems})</h3>
        </div>
        <Button asChild>
          <Link href='/create'>
            <Plus className='h-4 w-4 mr-2' />
            Create NFT
          </Link>
        </Button>
      </div>

      <div className='border rounded-lg'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NFT</TableHead>
              <TableHead>Collection</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Minted</TableHead>
              <TableHead className='w-[100px]'>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {nfts.map(nft => (
              <TableRow key={nft.id}>
                <TableCell>
                  <div className='flex items-center space-x-3'>
                    <div className='relative h-12 w-12 rounded overflow-hidden'>
                      <Image
                        src={nft.image}
                        alt={nft.name}
                        fill
                        className='object-cover'
                      />
                    </div>
                    <div>
                      <div className='font-medium'>{nft.name}</div>
                      <div className='text-sm text-muted-foreground'>
                        Token ID: #{nft.tokenId}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  {nft.collectionName ? (
                    <Badge variant='outline'>{nft.collectionName}</Badge>
                  ) : (
                    <span className='text-muted-foreground'>No collection</span>
                  )}
                </TableCell>
                <TableCell>
                  {nft.isListed && nft.listingPrice ? (
                    <div className='flex items-center'>
                      <span className='font-medium'>
                        {formatPrice(nft.listingPrice)}
                      </span>
                    </div>
                  ) : (
                    <span className='text-muted-foreground'>Not listed</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(nft)}</TableCell>
                <TableCell>{formatDate(nft.mintedAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant='ghost' size='sm'>
                        <MoreHorizontal className='h-4 w-4' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end'>
                      <DropdownMenuItem onClick={() => handleViewNFT(nft)}>
                        <Eye className='h-4 w-4 mr-2' />
                        View
                      </DropdownMenuItem>
                      {nft.isListed ? (
                        <DropdownMenuItem onClick={() => handleUnlistNFT(nft)}>
                          <TrendingUp className='h-4 w-4 mr-2' />
                          Unlist
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => handleListNFT(nft)}>
                          <DollarSign className='h-4 w-4 mr-2' />
                          List for Sale
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-between'>
          <div className='text-sm text-muted-foreground'>
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems}{' '}
            NFTs
          </div>
          <div className='flex items-center space-x-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
              Previous
            </Button>
            <div className='flex items-center space-x-1'>
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setCurrentPage(i + 1)}
                  className='w-8 h-8 p-0'
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setCurrentPage(prev => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
