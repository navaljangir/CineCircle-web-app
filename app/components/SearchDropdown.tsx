import { useState, useEffect, useRef, useCallback } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Search, Film, Tv, Clock, ExternalLink } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { quickSearchContent } from "~/services/contentService";
import { searchMovies } from "~/services/movieService";
import type { ContentSearchResult } from "~/types/content";
import type { Movie } from "~/types/movie";

interface SearchResult {
  id: number;
  title: string;
  description?: string;
  poster_url?: string;
  type: 'movie' | 'content';
  release_year?: number;
  contentType?: string;
}

export function SearchDropdown() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce the search query
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  // Use React Query for search
  const {
    data: results = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: async () => {
      if (debouncedQuery.trim().length < 2) return [];
      
      const [contentResults, movieResults] = await Promise.all([
        quickSearchContent(debouncedQuery).catch(() => []),
        searchMovies(debouncedQuery, 5).catch(() => [])
      ]);

      // Combine and format results
      const combinedResults: SearchResult[] = [
        // Add movie results
        ...movieResults.map((movie: Movie): SearchResult => ({
          id: movie.id,
          title: movie.title,
          description: movie.synopsis || movie.description,
          poster_url: movie.poster_url,
          type: 'movie',
          release_year: movie.release_year,
          contentType: 'movie'
        })),
        // Add content results
        ...contentResults.map((content: ContentSearchResult): SearchResult => ({
          id: content.id,
          title: content.title,
          description: content.description,
          poster_url: content.poster_url,
          type: 'content',
          contentType: content.contentType
        }))
      ];

      return combinedResults.slice(0, 8); // Limit to 8 results
    },
    enabled: debouncedQuery.trim().length >= 2,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (value.trim()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  const handleInputFocus = () => {
    if (query.trim()) {
      setIsOpen(true);
    }
  };

  const handleResultClick = () => {
    setIsOpen(false);
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.blur();
  };

  const getMediaIcon = (contentType: string) => {
    switch (contentType) {
      case 'movie':
        return <Film className="h-4 w-4" />;
      case 'episode':
        return <Clock className="h-4 w-4" />;
      case 'documentary':
        return <Tv className="h-4 w-4" />;
      case 'short':
        return <Film className="h-4 w-4" />;
      default:
        return <Film className="h-4 w-4" />;
    }
  };

  const getMediaTypeColor = (contentType: string) => {
    switch (contentType) {
      case 'movie':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'episode':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'documentary':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'short':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search movies, series..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          className="w-full pl-10 pr-4"
        />
      </div>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-hidden shadow-lg">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Searching...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-destructive">
                Search failed. Please try again.
              </div>
            ) : results.length > 0 ? (
              <div className="max-h-96 overflow-y-auto">
                {results.map((result) => (
                  <Link
                    key={`${result.type}-${result.id}`}
                    to={result.type === 'movie' ? `/movies/${encodeURIComponent(result.title)}` : `/content/${result.id}`}
                    onClick={handleResultClick}
                    className="block border-b last:border-b-0 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start gap-3 p-4">
                      {result.poster_url ? (
                        <img
                          src={result.poster_url}
                          alt={result.title}
                          className="w-12 h-16 object-cover rounded-sm flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-16 bg-muted rounded-sm flex-shrink-0 flex items-center justify-center">
                          {getMediaIcon(result.contentType || 'movie')}
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {result.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            <Badge 
                              variant="secondary" 
                              className={`text-xs flex-shrink-0 ${getMediaTypeColor(result.contentType || 'movie')}`}
                            >
                              {result.contentType || 'movie'}
                            </Badge>
                            {result.release_year && (
                              <span className="text-xs text-muted-foreground">
                                {result.release_year}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {result.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                      
                      <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-1" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : debouncedQuery.length >= 2 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No results found for "{debouncedQuery}"
              </div>
            ) : query.length > 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            ) : null}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
