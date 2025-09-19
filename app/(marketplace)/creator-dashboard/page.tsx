'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { usePrivy } from '@privy-io/react-auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import {
  Wallet,
  AlertCircle,
  Plus,
  BarChart3,
  Package,
  Layers,
} from 'lucide-react';
import { formatAddress } from '@/lib/custom-utils';
import { CreatorOverview } from './components/creator-overview';
import Link from 'next/link';
import { CreatorCollectionsTable } from './components/creator-collections-table';
import { CreatorItemsTable } from './components/creator-items-table';

export default function CreatorDashboardPage() {
  const { address, isConnected } = useAccount();
  const { authenticated } = usePrivy();
  const [activeTab, setActiveTab] = useState('overview');

  if (!authenticated || !isConnected || !address) {
    return (
      <div className='min-h-screen'>
        <section className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            <div className='text-center space-y-6'>
              <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center'>
                <Wallet className='w-12 h-12 text-gray-400' />
              </div>
              <div>
                <h1 className='text-3xl font-bold mb-2'>Creator Dashboard</h1>
                <p className='text-muted-foreground'>
                  Connect your wallet to access your creator dashboard and
                  manage your NFTs
                </p>
              </div>
              <div className='p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-950 dark:border-amber-800'>
                <div className='flex items-center space-x-2'>
                  <AlertCircle className='w-4 h-4 text-amber-600' />
                  <span className='text-sm font-medium text-amber-800 dark:text-amber-200'>
                    Wallet Not Connected
                  </span>
                </div>
                <p className='text-sm text-amber-700 dark:text-amber-300 mt-1'>
                  Please connect your wallet to view your creator dashboard
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className='min-h-screen'>
      <section className='container mx-auto px-4 py-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-8'>
            <PageBreadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Creator Dashboard' },
              ]}
              className='mb-4'
            />
            <div className='flex justify-between lg:flex-row flex-col'>
              <div>
                <h1 className='text-3xl font-bold'>Creator Dashboard</h1>
                <p className='text-muted-foreground'>
                  Manage your NFTs, collections, and marketplace listings
                </p>
              </div>
              <div className='flex items-center gap-3 mt-4 lg:mt-0'>
                <Badge variant='outline' className='flex items-center gap-2'>
                  <Wallet className='h-4 w-4' />
                  {formatAddress(address)}
                </Badge>
                <Button asChild className='hidden lg:flex'>
                  <Link href='/create'>
                    <Plus className='h-4 w-4 mr-2' />
                    Create NFT
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='space-y-6'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='overview'>Overview</TabsTrigger>
              <TabsTrigger value='items'>Items</TabsTrigger>
              <TabsTrigger value='collections'>Collections</TabsTrigger>
            </TabsList>

            <TabsContent value='overview' className='space-y-6'>
              <CreatorOverview walletAddress={address} />
            </TabsContent>

            <TabsContent value='items' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>My NFTs</CardTitle>
                  <CardDescription>
                    Manage your minted NFTs and their marketplace listings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreatorItemsTable walletAddress={address} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value='collections' className='space-y-6'>
              <Card>
                <CardHeader>
                  <CardTitle>My Collections</CardTitle>
                  <CardDescription>
                    View and manage your NFT collections
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <CreatorCollectionsTable walletAddress={address} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}
