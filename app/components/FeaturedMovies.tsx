import { useState, useEffect } from "react";
import { Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Star, Calendar, Clock, Play, Info } from "lucide-react";
import { getFeaturedMovies } from "~/services/movieService";
import type { Movie } from "~/types/movie";
import { formatDecimal, formatDuration } from "~/lib/uiHelper";

interface FeaturedMoviesProps {
  limit?: number;
}

export function FeaturedMovies({ limit = 3 }: FeaturedMoviesProps) { // Reduced from 5 to 3
  const [currentIndex, setCurrentIndex] = useState(0);

  const {
    data: movies = [],
    isLoading: loading,
    error
  } = useQuery({
    queryKey: ['featured-movies', limit],
    queryFn: () => getFeaturedMovies(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (movies.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % movies.length);
      }, 5000); // Change every 5 seconds

      return () => clearInterval(interval);
    }
  }, [movies.length]);

  if (loading) {
    return (
      <div className="relative w-full h-[500px] bg-muted animate-pulse rounded-lg" />
    );
  }

  if (error || movies.length === 0) {
    return (
      <Card className="w-full h-[500px] flex items-center justify-center">
        <CardContent>
          <p className="text-muted-foreground">
            {error ? "Failed to load featured movies" : "No featured movies available"}
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentMovie = movies[currentIndex];

  return (
    <div className="relative w-full h-[500px] rounded-lg overflow-hidden group">
      {/* Background Image */}
      <div className="absolute inset-0">
        {currentMovie.banner_url || currentMovie.poster_url ? (
          <img
            src={currentMovie.banner_url || currentMovie.poster_url}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary/20 to-secondary/20" />
        )}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Badge className="bg-primary text-primary-foreground">
                Featured Movie
              </Badge>
              {formatDecimal(currentMovie.imdb_rating, 1) && (
                <div className="flex items-center gap-1 text-white/90">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">
                    {formatDecimal(currentMovie.imdb_rating, 1)}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              {currentMovie.title}
            </h1>

            <div className="flex items-center gap-4 text-white/80 mb-4">
              {currentMovie.release_year && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {currentMovie.release_year}
                </div>
              )}
              
              {currentMovie.duration_minutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(currentMovie.duration_minutes)}
                </div>
              )}
              
              {currentMovie.genre && (
                <div className="flex items-center gap-1">
                  <span>{currentMovie.genre.split(',')[0].trim()}</span>
                </div>
              )}
            </div>

            {(currentMovie.description || currentMovie.synopsis) && (
              <p className="text-white/90 text-lg mb-6 line-clamp-3">
                {currentMovie.synopsis || currentMovie.description}
              </p>
            )}

            <div className="flex gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link to={`/movies/${encodeURIComponent(currentMovie.title)}`}>
                  <Play className="h-5 w-5" />
                  Watch Now
                </Link>
              </Button>
              
              <Button asChild variant="outline" size="lg" className="gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20">
                <Link to={`/movies/${encodeURIComponent(currentMovie.title)}`}>
                  <Info className="h-5 w-5" />
                  More Info
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Dots */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentIndex
                  ? "bg-white scale-110"
                  : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Movie Navigation */}
      {movies.length > 1 && (
        <div className="absolute top-4 right-4 bg-black/50 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-sm">
            {currentIndex + 1} / {movies.length}
          </span>
        </div>
      )}
    </div>
  );
}
