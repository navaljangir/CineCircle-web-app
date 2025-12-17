import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, useSearchParams, Link } from "react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Search, Filter, Film, SlidersHorizontal } from "lucide-react";
import { getMovies, addMovieToWatchlist, removeMovieFromWatchlist } from "~/services/movieService";
import { VirtualizedMovieGrid } from "~/components/VirtualizedMovieGrid";
import { FeaturedMovies } from "~/components/FeaturedMovies";
import type { Movie, MovieSearchOptions, MovieSearchResult } from "~/types/movie";

export const meta: MetaFunction = () => {
  return [
    { title: "Movies - CineCircle" },
    { name: "description", content: "Discover and watch amazing movies on CineCircle." },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  
  const options: MovieSearchOptions = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'), // Reduced from 20 to 12
    search: searchParams.get('search') || undefined,
    genre: searchParams.get('genre') || undefined,
    director: searchParams.get('director') || undefined,
    language: searchParams.get('language') || undefined,
    country: searchParams.get('country') || undefined,
    releaseYear: searchParams.get('releaseYear') ? parseInt(searchParams.get('releaseYear')!) : undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
  };

  try {
    const moviesData = await getMovies(options, request);
    return { moviesData, options };
  } catch (error) {
    console.error('Failed to load movies:', error);
    return { 
      moviesData: { movies: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0, hasNext: false, hasPrev: false } }, // Updated limit
      options 
    };
  }
}

export default function Movies() {
  const { moviesData: initialData, options: initialOptions } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const queryClient = useQueryClient();

  // Filter states
  const [searchTerm, setSearchTerm] = useState(initialOptions.search || '');
  const [selectedGenre, setSelectedGenre] = useState(initialOptions.genre || '');
  const [selectedLanguage, setSelectedLanguage] = useState(initialOptions.language || '');
  const [selectedYear, setSelectedYear] = useState(initialOptions.releaseYear?.toString() || '');
  const [minRating, setMinRating] = useState(initialOptions.minRating?.toString() || '');

  // Create search options from current state
  const searchOptions: MovieSearchOptions = {
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'), // Reduced from 20 to 12
    search: searchParams.get('search') || undefined,
    genre: searchParams.get('genre') || undefined,
    director: searchParams.get('director') || undefined,
    language: searchParams.get('language') || undefined,
    country: searchParams.get('country') || undefined,
    releaseYear: searchParams.get('releaseYear') ? parseInt(searchParams.get('releaseYear')!) : undefined,
    minRating: searchParams.get('minRating') ? parseFloat(searchParams.get('minRating')!) : undefined,
    isFeatured: searchParams.get('isFeatured') === 'true' ? true : undefined,
  };

  // Fetch movies with React Query
  const {
    data: moviesData = initialData,
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['movies', searchOptions],
    queryFn: () => getMovies(searchOptions),
    initialData,
    staleTime: 1000 * 60 * 3, // 3 minutes (reduced for fresher data)
    gcTime: 1000 * 60 * 10, // 10 minutes (increased for better caching)
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch if data exists
  });

  // Watchlist mutations
  const addToWatchlistMutation = useMutation({
    mutationFn: (movieId: number) => addMovieToWatchlist(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => {
      console.error('Failed to add to watchlist:', error);
    }
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: (movieId: number) => removeMovieFromWatchlist(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
    },
    onError: (error) => {
      console.error('Failed to remove from watchlist:', error);
    }
  });

  const handleSearch = () => {
    const newParams = new URLSearchParams();
    
    if (searchTerm) newParams.set('search', searchTerm);
    if (selectedGenre) newParams.set('genre', selectedGenre);
    if (selectedLanguage) newParams.set('language', selectedLanguage);
    if (selectedYear) newParams.set('releaseYear', selectedYear);
    if (minRating) newParams.set('minRating', minRating);
    
    setSearchParams(newParams);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedGenre('');
    setSelectedLanguage('');
    setSelectedYear('');
    setMinRating('');
    setSearchParams({});
  };

  const handlePageChange = (page: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', page.toString());
    setSearchParams(newParams);
  };

  const handleAddToWatchlist = (movieId: number) => {
    addToWatchlistMutation.mutate(movieId);
  };

  const handleRemoveFromWatchlist = (movieId: number) => {
    removeFromWatchlistMutation.mutate(movieId);
  };

  const generatePageNumbers = () => {
    const { page, totalPages } = moviesData.pagination;
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Featured Movies Section */}
      {!initialOptions.search && moviesData.pagination.page === 1 && (
        <section className="mb-12">
          <FeaturedMovies limit={3} />
        </section>
      )}

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Movies</h1>
            <p className="text-muted-foreground">
              Discover amazing movies from around the world
            </p>
          </div>
          
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className={`mb-8 transition-all duration-200 ${showFilters ? 'block' : 'hidden'}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search movies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Genre</label>
                <Input
                  placeholder="e.g., Action, Drama"
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Language</label>
                <Input
                  placeholder="e.g., English, Spanish"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Release Year</label>
                <Input
                  type="number"
                  placeholder="e.g., 2023"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Min Rating</label>
                <Input
                  type="number"
                  placeholder="e.g., 7.0"
                  step="0.1"
                  min="0"
                  max="10"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSearch} className="gap-2">
                <Search className="h-4 w-4" />
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Filters */}
        {(initialOptions.search || initialOptions.genre || initialOptions.language || initialOptions.releaseYear || initialOptions.minRating) && (
          <div className="mb-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">Active filters:</span>
              {initialOptions.search && (
                <Badge variant="secondary">Search: {initialOptions.search}</Badge>
              )}
              {initialOptions.genre && (
                <Badge variant="secondary">Genre: {initialOptions.genre}</Badge>
              )}
              {initialOptions.language && (
                <Badge variant="secondary">Language: {initialOptions.language}</Badge>
              )}
              {initialOptions.releaseYear && (
                <Badge variant="secondary">Year: {initialOptions.releaseYear}</Badge>
              )}
              {initialOptions.minRating && (
                <Badge variant="secondary">Rating: {initialOptions.minRating}+</Badge>
              )}
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Showing {moviesData.movies.length} of {moviesData.pagination.total} movies
          </p>
        </div>

        {/* Movies Grid */}
        <VirtualizedMovieGrid
          movies={moviesData.movies}
          onAddToWatchlist={handleAddToWatchlist}
          onRemoveFromWatchlist={handleRemoveFromWatchlist}
          loading={loading}
          className="mb-8"
        />

        {/* Pagination */}
        {moviesData.pagination.totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-8">
            <Button
              variant="outline"
              disabled={!moviesData.pagination.hasPrev}
              onClick={() => handlePageChange(moviesData.pagination.page - 1)}
            >
              Previous
            </Button>
            
            {generatePageNumbers().map((pageNum) => (
              <Button
                key={pageNum}
                variant={pageNum === moviesData.pagination.page ? "default" : "outline"}
                onClick={() => handlePageChange(pageNum)}
                className="w-10"
              >
                {pageNum}
              </Button>
            ))}
            
            <Button
              variant="outline"
              disabled={!moviesData.pagination.hasNext}
              onClick={() => handlePageChange(moviesData.pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        )}

        {/* Empty State */}
        {moviesData.movies.length === 0 && (
          <div className="text-center py-12">
            <Film className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No movies found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search criteria or browse all movies.
            </p>
            <Button onClick={handleClearFilters}>Clear Filters</Button>
          </div>
        )}
      </div>
    </div>
  );
}
