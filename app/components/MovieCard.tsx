import { Link } from "react-router";
import { Card, CardContent, CardFooter } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { LazyImage } from "~/components/ui/lazy-image";
import { Star, Clock, Calendar, Plus, Check } from "lucide-react";
import type { Movie } from "~/types/movie";
import { formatDecimal, formatDuration, formatPercentage } from "~/lib/uiHelper";

interface MovieCardProps {
  movie: Movie;
  onAddToWatchlist?: (movieId: number) => void;
  onRemoveFromWatchlist?: (movieId: number) => void;
  isLoading?: boolean;
  watchlistLoading?: boolean;
}

export function MovieCard({ 
  movie, 
  onAddToWatchlist, 
  onRemoveFromWatchlist,
  isLoading = false,
  watchlistLoading = false
}: MovieCardProps) {
  const handleWatchlistToggle = () => {
    if (movie.isInWatchlist) {
      onRemoveFromWatchlist?.(movie.id);
    } else {
      onAddToWatchlist?.(movie.id);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200 overflow-hidden h-full flex flex-col">
      <Link to={`/movies/${encodeURIComponent(movie.title)}`} className="block">
        <div className="relative overflow-hidden">
          {movie.poster_url ? (
            <LazyImage
              src={movie.poster_url}
              alt={movie.title}
              aspectRatio="2/3"
              className="group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="aspect-[2/3] w-full bg-muted flex items-center justify-center">
              <span className="text-muted-foreground text-sm">No Image</span>
            </div>
          )}
          
          {movie.is_featured && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
              Featured
            </Badge>
          )}
          
          {formatDecimal(movie.imdb_rating, 1) && (
            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded-md flex items-center gap-1 text-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {formatDecimal(movie.imdb_rating, 1)}
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4 flex-1">
        <Link to={`/movies/${encodeURIComponent(movie.title)}`} className="block">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
        </Link>
        
        <div className="space-y-2 text-sm text-muted-foreground">
          {movie.director && (
            <p className="line-clamp-1">
              <span className="font-medium">Director:</span> {movie.director}
            </p>
          )}
          
          <div className="flex items-center gap-4">
            {movie.release_year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {movie.release_year}
              </div>
            )}
            
            {movie.duration_minutes && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatDuration(movie.duration_minutes)}
              </div>
            )}
          </div>
          
          {movie.genre && (
            <div className="flex flex-wrap gap-1">
              {movie.genre.split(',').map((genre, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {genre.trim()}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {movie.watchProgress && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Progress</span>
              <span>{formatPercentage(movie.watchProgress.progress_percentage, 0)}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${movie.watchProgress.progress_percentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Button asChild size="sm" className="flex-1">
            <Link to={`/movies/${encodeURIComponent(movie.title)}`}>
              View Details
            </Link>
          </Button>
          
          {(onAddToWatchlist || onRemoveFromWatchlist) && (
            <Button 
              size="sm" 
              variant={movie.isInWatchlist ? "default" : "outline"}
              onClick={handleWatchlistToggle}
              disabled={isLoading || watchlistLoading}
              className="px-3"
            >
              {movie.isInWatchlist ? (
                <Check className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
