import { useRef, useEffect } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MovieCard } from "./MovieCard";
import type { Movie } from "~/types/movie";

interface VirtualizedMovieGridProps {
  movies: Movie[];
  onAddToWatchlist?: (movieId: number) => void;
  onRemoveFromWatchlist?: (movieId: number) => void;
  loading?: boolean;
  className?: string;
}

export function VirtualizedMovieGrid({
  movies,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  loading = false,
  className = "",
}: VirtualizedMovieGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Calculate number of columns based on screen width
  const getColumnCount = () => {
    if (typeof window === "undefined") return 5;
    const width = window.innerWidth;
    if (width < 640) return 1; // sm
    if (width < 768) return 2; // md
    if (width < 1024) return 3; // lg
    if (width < 1280) return 4; // xl
    return 5; // 2xl+
  };

  const columnCount = getColumnCount();
  const rowCount = Math.ceil(movies.length / columnCount);

  // Virtualizer for rows only (horizontal stays normal)
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 450, // Approximate height of a card (image + content)
    overscan: 2, // Render 2 extra rows for smooth scrolling
  });

  useEffect(() => {
    const handleResize = () => {
      rowVirtualizer.measure();
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [rowVirtualizer]);

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 ${className}`}
      >
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
    <div ref={parentRef} className={`h-full overflow-auto ${className}`}>
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const startIndex = virtualRow.index * columnCount;
          const rowMovies = movies.slice(startIndex, startIndex + columnCount);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-1">
                {rowMovies.map((movie) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    onAddToWatchlist={onAddToWatchlist}
                    onRemoveFromWatchlist={onRemoveFromWatchlist}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
