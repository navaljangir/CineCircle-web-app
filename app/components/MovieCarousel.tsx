import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { MovieCard } from "./MovieCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Movie } from "~/types/movie";

interface MovieCarouselProps {
  title: string;
  movies: Movie[];
  viewAllLink?: string;
  onAddToWatchlist?: (movieId: number) => void;
  onRemoveFromWatchlist?: (movieId: number) => void;
}

export function MovieCarousel({ 
  title, 
  movies, 
  viewAllLink,
  onAddToWatchlist,
  onRemoveFromWatchlist
}: MovieCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320; // Width of one card plus gap
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (movies.length === 0) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">{title}</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('left')}
            className="hidden sm:flex"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => scroll('right')}
            className="hidden sm:flex"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          {viewAllLink && (
            <Button asChild variant="outline" size="sm">
              <Link to={viewAllLink}>View All</Link>
            </Button>
          )}
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {movies.map((movie) => (
          <div key={movie.id} className="flex-none w-72">
            <MovieCard
              movie={movie}
              onAddToWatchlist={onAddToWatchlist}
              onRemoveFromWatchlist={onRemoveFromWatchlist}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
