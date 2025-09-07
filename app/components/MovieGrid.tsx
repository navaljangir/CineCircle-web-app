import { MovieCard } from "./MovieCard";
import type { Movie } from "~/types/movie";

interface MovieGridProps {
  movies: Movie[];
  onAddToWatchlist?: (movieId: number) => void;
  onRemoveFromWatchlist?: (movieId: number) => void;
  loading?: boolean;
  className?: string;
}

export function MovieGrid({ 
  movies, 
  onAddToWatchlist, 
  onRemoveFromWatchlist,
  loading = false,
  className = ""
}: MovieGridProps) {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}>
        {Array.from({ length: 10 }).map((_, index) => (
          <div key={index} className="space-y-4">
            <div className="aspect-[2/3] bg-muted animate-pulse rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
              <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">No movies found</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}>
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onAddToWatchlist={onAddToWatchlist}
          onRemoveFromWatchlist={onRemoveFromWatchlist}
          isLoading={loading}
        />
      ))}
    </div>
  );
}
