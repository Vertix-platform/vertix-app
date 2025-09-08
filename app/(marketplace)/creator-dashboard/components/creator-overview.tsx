'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Package,
  Layers,
  TrendingUp,
  DollarSign,
  Eye,
  Plus,
  ExternalLink,
} from 'lucide-react';
import { formatPrice } from '@/lib/custom-utils';
import Link from 'next/link';

interface CreatorStats {
  totalNfts: number;
  totalCollections: number;
  listedNfts: number;
  totalVolume: number;
  recentActivity: Array<{
    id: string;
    type: 'mint' | 'list' | 'sale';
    nftName: string;
    timestamp: string;
    amount?: number;
  }>;
}

interface CreatorOverviewProps {
  walletAddress: string;
}

export function CreatorOverview({ walletAddress }: CreatorOverviewProps) {
  const [stats, setStats] = useState<CreatorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call to fetch creator stats
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // TODO: Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock data for now
        setStats({
          totalNfts: 12,
          totalCollections: 3,
          listedNfts: 8,
          totalVolume: 2.5,
          recentActivity: [
            {
              id: '1',
              type: 'mint',
              nftName: 'Cool NFT #1',
              timestamp: '2 hours ago',
            },
            {
              id: '2',
              type: 'list',
              nftName: 'Awesome Art #5',
              timestamp: '1 day ago',
              amount: 0.5,
            },
            {
              id: '3',
              type: 'sale',
              nftName: 'Digital Masterpiece #3',
              timestamp: '3 days ago',
              amount: 1.2,
            },
          ],
        });
      } catch (error) {
        console.error('Failed to fetch creator stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [walletAddress]);

  if (isLoading) {
    return (
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <Skeleton className='h-4 w-24' />
              <Skeleton className='h-4 w-4' />
            </CardHeader>
            <CardContent>
              <Skeleton className='h-8 w-16 mb-1' />
              <Skeleton className='h-3 w-32' />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className='p-6'>
          <div className='text-center text-muted-foreground'>
            Failed to load creator statistics
          </div>
        </CardContent>
      </Card>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <Plus className='h-4 w-4 text-green-600' />;
      case 'list':
        return <TrendingUp className='h-4 w-4 text-blue-600' />;
      case 'sale':
        return <DollarSign className='h-4 w-4 text-purple-600' />;
      default:
        return <Eye className='h-4 w-4' />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'mint':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'list':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'sale':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className='space-y-6'>
      {/* Stats Cards */}
      <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total NFTs</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalNfts}</div>
            <p className='text-xs text-muted-foreground'>
              {stats.listedNfts} listed for sale
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Collections</CardTitle>
            <Layers className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.totalCollections}</div>
            <p className='text-xs text-muted-foreground'>Active collections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Listed Items</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{stats.listedNfts}</div>
            <p className='text-xs text-muted-foreground'>
              Available for purchase
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Volume</CardTitle>
            <DollarSign className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>
              {formatPrice(stats.totalVolume)}
            </div>
            <p className='text-xs text-muted-foreground'>Lifetime sales</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className='grid gap-6 lg:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest NFT activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-4'>
              {stats.recentActivity.map(activity => (
                <div key={activity.id} className='flex items-center space-x-4'>
                  <div
                    className={`p-2 rounded-full border ${getActivityColor(activity.type)}`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className='flex-1 space-y-1'>
                    <p className='text-sm font-medium'>
                      {activity.type === 'mint' && 'Minted'}
                      {activity.type === 'list' && 'Listed'}
                      {activity.type === 'sale' && 'Sold'} {activity.nftName}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      {activity.timestamp}
                      {activity.amount && ` • ${formatPrice(activity.amount)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for creators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              <Button asChild className='w-full justify-start'>
                <Link href='/create'>
                  <Plus className='h-4 w-4 mr-2' />
                  Create New NFT
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/create/create-collection'>
                  <Layers className='h-4 w-4 mr-2' />
                  Create Collection
                </Link>
              </Button>
              <Button
                asChild
                variant='outline'
                className='w-full justify-start'
              >
                <Link href='/marketplace'>
                  <ExternalLink className='h-4 w-4 mr-2' />
                  Browse Marketplace
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
