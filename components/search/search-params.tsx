'use client';

import { useQueryState, parseAsString, parseAsInteger } from 'nuqs';

export interface SearchParams {
  query: string;
  type: 'all' | 'nft' | 'creator' | 'collection' | 'social-media' | 'non-nft';
  sort: 'relevance' | 'price-low' | 'price-high' | 'newest' | 'oldest';
  page: number;
  limit: number;
}

export interface SearchParamsActions {
  setQuery: (query: string) => void;
  setType: (type: SearchParams['type']) => void;
  setSort: (sort: SearchParams['sort']) => void;
  setPage: (page: number) => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export const useSearchParams = (): SearchParams & SearchParamsActions => {
  // Search query parameter
  const [query, setQuery] = useQueryState('q', parseAsString.withDefault(''));

  // Type filter parameter
  const [type, setType] = useQueryState('type', parseAsString.withDefault('all'));

  // Sort parameter
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('relevance'));

  // Pagination parameters
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1));
  const [limit, setLimit] = useQueryState('limit', parseAsInteger.withDefault(20));

  // Reset function
  const reset = () => {
    setQuery('');
    setType('all');
    setSort('relevance');
    setPage(1);
    setLimit(20);
  };

  return {
    // Current values
    query: query || '',
    type: (type as SearchParams['type']) || 'all',
    sort: (sort as SearchParams['sort']) || 'relevance',
    page: page || 1,
    limit: limit || 20,

    // Actions
    setQuery,
    setType,
    setSort,
    setPage,
    setLimit,
    reset,
  };
};

// Hook for advanced search with additional filters
export const useAdvancedSearchParams = () => {
  const baseParams = useSearchParams();

  // Additional advanced filters
  const [minPrice, setMinPrice] = useQueryState('minPrice', parseAsInteger);
  const [maxPrice, setMaxPrice] = useQueryState('maxPrice', parseAsInteger);
  const [tags, setTags] = useQueryState('tags', parseAsString.withDefault(''));
  const [creator, setCreator] = useQueryState('creator', parseAsString.withDefault(''));

  return {
    ...baseParams,
    minPrice: minPrice || undefined,
    maxPrice: maxPrice || undefined,
    tags: tags || [],
    creator: creator || '',
    setMinPrice,
    setMaxPrice,
    setTags,
    setCreator,
  };
};

// Component for search form with URL sync
export const SearchForm = ({
  placeholder = "Search NFTs, creators, collections...",
  className = "",
  onSearch,
}: {
  placeholder?: string;
  className?: string;
  onSearch?: (query: string) => void;
}) => {
  const { query, setQuery } = useSearchParams();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </form>
  );
};

// Component for search filters
export const SearchFilters = () => {
  const { type, sort, setType, setSort } = useSearchParams();

  return (
    <div className="flex flex-wrap items-center gap-4">
      {/* Type Filter */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Type:</span>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as SearchParams['type'])}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="all">All</option>
          <option value="nft">NFTs</option>
          <option value="creator">Creators</option>
          <option value="collection">Collections</option>
          <option value="social-media">Social Media</option>
          <option value="non-nft">Non-NFT</option>
        </select>
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Sort by:</span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SearchParams['sort'])}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value="relevance">Relevance</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>
    </div>
  );
};

// Component for pagination
export const SearchPagination = () => {
  const { page, limit, setPage, setLimit } = useSearchParams();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">Show:</span>
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="text-sm border rounded-md px-2 py-1"
        >
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span className="text-sm">per page</span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page <= 1}
          className="px-3 py-1 text-sm border rounded-md disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm">Page {page}</span>
        <button
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 text-sm border rounded-md"
        >
          Next
        </button>
      </div>
    </div>
  );
};
