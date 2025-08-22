'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, SearchForm, SearchFilters, SearchPagination } from '@/components/search/search-params';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

// Mock search results - replace with actual API calls
interface SearchResult {
  id: string;
  type: 'nft' | 'creator' | 'collection' | 'social-media' | 'non-nft';
  title: string;
  description: string;
  image?: string;
  price?: string;
  creator?: string;
  tags: string[];
}

const mockSearchResults: SearchResult[] = [
  {
    id: '1',
    type: 'nft',
    title: 'Cosmic Explorer #1234',
    description: 'A unique digital artwork exploring the depths of space',
    price: '0.5 ETH',
    creator: '0x1234...5678',
    tags: ['art', 'space', 'cosmic'],
  },
  {
    id: '2',
    type: 'creator',
    title: 'Digital Artist Studio',
    description: 'Professional digital art studio specializing in NFT collections',
    creator: '0x5678...9012',
    tags: ['artist', 'studio', 'professional'],
  },
  {
    id: '3',
    type: 'collection',
    title: 'Metaverse Avatars',
    description: 'Exclusive collection of metaverse-ready avatar NFTs',
    price: '0.1 ETH',
    creator: '0x9012...3456',
    tags: ['avatar', 'metaverse', 'gaming'],
  },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate search API call
  useEffect(() => {
    if (!searchParams.query.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    
    // Simulate API delay
    const timer = setTimeout(() => {
      const filteredResults = mockSearchResults.filter(result => {
        const matchesQuery = result.title.toLowerCase().includes(searchParams.query.toLowerCase()) ||
                           result.description.toLowerCase().includes(searchParams.query.toLowerCase()) ||
                           result.tags.some(tag => tag.toLowerCase().includes(searchParams.query.toLowerCase()));
        
        const matchesType = searchParams.type === 'all' || result.type === searchParams.type;
        
        return matchesQuery && matchesType;
      });

      // Apply sorting
      const sortedResults = [...filteredResults].sort((a, b) => {
        switch (searchParams.sort) {
          case 'price-low':
            return (parseFloat(a.price?.replace(' ETH', '') || '0') - parseFloat(b.price?.replace(' ETH', '') || '0'));
          case 'price-high':
            return (parseFloat(b.price?.replace(' ETH', '') || '0') - parseFloat(a.price?.replace(' ETH', '') || '0'));
          case 'newest':
            return b.id.localeCompare(a.id);
          case 'oldest':
            return a.id.localeCompare(b.id);
          default:
            return 0;
        }
      });

      setResults(sortedResults);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchParams.query, searchParams.type, searchParams.sort]);

  const getTypeBadge = (type: string) => {
    const variants = {
      nft: 'default',
      creator: 'secondary',
      collection: 'outline',
      'social-media': 'outline',
      'non-nft': 'outline',
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'default'}>
        {type.toUpperCase()}
      </Badge>
    );
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Search Header */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Search Results</h1>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search NFTs, creators, collections..."
              value={searchParams.query}
              onChange={(e) => searchParams.setQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Search Stats */}
          {searchParams.query && (
            <p className="text-muted-foreground">
              Found {results.length} result{results.length !== 1 ? 's' : ''} for "{searchParams.query}"
            </p>
          )}
        </div>

        {/* Filters */}
        <SearchFilters />

        {/* Results */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Searching...</span>
          </div>
        ) : results.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((result) => (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{result.title}</CardTitle>
                      {getTypeBadge(result.type)}
                    </div>
                    <CardDescription>{result.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {result.price && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Price:</span>
                        <span className="text-sm font-mono">{result.price}</span>
                      </div>
                    )}

                    {result.creator && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Creator:</span>
                        <span className="text-sm font-mono">{result.creator}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {result.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <Button asChild className="w-full">
                      <Link href={`/${result.type}/${result.id}`}>
                        View Details
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <SearchPagination />
          </div>
        ) : searchParams.query ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground text-center">
                Try adjusting your search terms or filters to find what you're looking for.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Start searching</h3>
              <p className="text-muted-foreground text-center">
                Enter a search term above to find NFTs, creators, and collections.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
