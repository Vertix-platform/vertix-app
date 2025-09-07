'use client'

import { useState, useEffect } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Eye, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Package,
  TrendingUp
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface CreatorCollection {
  id: number
  name: string
  symbol: string
  image: string
  description: string
  maxSupply: number
  currentSupply: number
  createdAt: string
  totalVolume: number
  floorPrice?: number
}

interface CreatorCollectionsTableProps {
  walletAddress: string
}

const ITEMS_PER_PAGE = 10

export function CreatorCollectionsTable({ walletAddress }: CreatorCollectionsTableProps) {
  const [collections, setCollections] = useState<CreatorCollection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)

  useEffect(() => {
    const fetchCollections = async () => {
      setIsLoading(true)
      try {
        // TODO: Replace with actual API call to fetch user's collections
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Mock data for now
        const mockCollections: CreatorCollection[] = [
          {
            id: 1,
            name: 'Cool Collection',
            symbol: 'COOL',
            image: '/images/nft-placeholder.png',
            description: 'A collection of cool NFTs',
            maxSupply: 100,
            currentSupply: 15,
            createdAt: '2024-01-10T10:30:00Z',
            totalVolume: 2.5,
            floorPrice: 0.3
          },
          {
            id: 2,
            name: 'Awesome Art',
            symbol: 'ART',
            image: '/images/nft-placeholder.png',
            description: 'Digital art collection',
            maxSupply: 50,
            currentSupply: 8,
            createdAt: '2024-01-08T15:45:00Z',
            totalVolume: 1.8,
            floorPrice: 0.4
          }
        ]

        setCollections(mockCollections)
        setTotalItems(mockCollections.length)
        setTotalPages(Math.ceil(mockCollections.length / ITEMS_PER_PAGE))
      } catch (error) {
        console.error('Failed to fetch collections:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCollections()
  }, [walletAddress, currentPage])

  const handleViewCollection = (collection: CreatorCollection) => {
    // TODO: Navigate to collection detail page
    console.log('View collection:', collection)
  }

  const handleMintToCollection = (collection: CreatorCollection) => {
    // TODO: Navigate to mint to collection page
    console.log('Mint to collection:', collection)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getSupplyProgress = (current: number, max: number) => {
    const percentage = (current / max) * 100
    return {
      percentage,
      isNearLimit: percentage > 80,
      isFull: percentage >= 100
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Collection</TableHead>
                <TableHead>Supply</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Floor Price</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(3)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Skeleton className="h-12 w-12 rounded" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-8" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Plus className="w-12 h-12 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No collections yet</h3>
        <p className="text-gray-500 mb-6">Create your first collection to organize your NFTs!</p>
        <Button asChild>
          <Link href="/create/create-collection">
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">My Collections ({totalItems})</h3>
        </div>
        <Button asChild>
          <Link href="/create/create-collection">
            <Plus className="h-4 w-4 mr-2" />
            Create Collection
          </Link>
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Collection</TableHead>
              <TableHead>Supply</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Floor Price</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {collections.map((collection) => {
              const supplyProgress = getSupplyProgress(collection.currentSupply, collection.maxSupply)

              return (
                <TableRow key={collection.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative h-12 w-12 rounded overflow-hidden">
                        <Image
                          src={collection.image}
                          alt={collection.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{collection.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {collection.symbol} • ID: #{collection.id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span>{collection.currentSupply}</span>
                        <span className="text-muted-foreground">/ {collection.maxSupply}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            supplyProgress.isFull
                              ? 'bg-red-500'
                              : supplyProgress.isNearLimit
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(supplyProgress.percentage, 100)}%` }}
                        />
                      </div>
                      {supplyProgress.isFull && (
                        <Badge variant="destructive" className="text-xs">
                          Full
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1 text-green-600" />
                      <span className="font-medium">{collection.totalVolume.toFixed(2)} ETH</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {collection.floorPrice ? (
                      <span className="font-medium">{collection.floorPrice.toFixed(2)} ETH</span>
                    ) : (
                      <span className="text-muted-foreground">No listings</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(collection.createdAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewCollection(collection)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Collection
                        </DropdownMenuItem>
                        {!supplyProgress.isFull && (
                          <DropdownMenuItem onClick={() => handleMintToCollection(collection)}>
                            <Package className="h-4 w-4 mr-2" />
                            Mint to Collection
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(currentPage * ITEMS_PER_PAGE, totalItems)} of {totalItems} collections
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {[...Array(totalPages)].map((_, i) => (
                <Button
                  key={i + 1}
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className="w-8 h-8 p-0"
                >
                  {i + 1}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
