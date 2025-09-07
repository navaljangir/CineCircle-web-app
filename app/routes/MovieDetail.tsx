import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link, useNavigate } from "react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { 
  ArrowLeft, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Calendar, 
  Clock, 
  Globe, 
  User,
  BookOpen
} from "lucide-react";
import { 
  getMovieByIdOrTitle,
  getMovieCastCrew,
  getMovieRelatedContent,
  addMovieToWatchlist,
  removeMovieFromWatchlist
} from "~/services/movieService";
import type { Movie, CastCrewMember, RelatedContent } from "~/types/movie";
import { formatDecimal, formatDuration, formatLargeCurrency } from "~/lib/uiHelper";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const movie = data?.movie;
  return [
    { title: movie ? `${movie.title} - CineCircle` : "Movie Not Found - CineCircle" },
    { 
      name: "description", 
      content: movie?.synopsis || movie?.description || "Watch movies on CineCircle." 
    },
  ];
};

export async function loader({ params, request }: LoaderFunctionArgs) {
  const titleOrId = params.id;
  
  if (!titleOrId) {
    throw new Response("Movie not found", { status: 404 });
  }

  try {
    const [movie, castCrew, relatedContent] = await Promise.all([
      getMovieByIdOrTitle(titleOrId, request),
      getMovieCastCrew(titleOrId, request).catch(() => []),
      getMovieRelatedContent(titleOrId, request).catch(() => [])
    ]);

    if (!movie) {
      throw new Response("Movie not found", { status: 404 });
    }

    return { 
      movie,
      castCrew,
      relatedContent,
      titleOrId
    };
  } catch (error) {
    throw new Response("Movie not found", { status: 404 });
  }
}

export default function MovieDetail() {
  const { movie: initialMovie, castCrew: initialCastCrew, relatedContent: initialRelatedContent, titleOrId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isInWatchlist, setIsInWatchlist] = useState(initialMovie.isInWatchlist || false);

  // Fetch movie details with React Query
  const {
    data: movie = initialMovie,
    isLoading: movieLoading
  } = useQuery({
    queryKey: ['movie', titleOrId],
    queryFn: () => getMovieByIdOrTitle(titleOrId),
    initialData: initialMovie,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch cast and crew
  const {
    data: castCrew = initialCastCrew,
    isLoading: castLoading
  } = useQuery({
    queryKey: ['movie-cast', titleOrId],
    queryFn: () => getMovieCastCrew(titleOrId),
    initialData: initialCastCrew,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Fetch related content
  const {
    data: relatedContent = initialRelatedContent,
    isLoading: relatedLoading
  } = useQuery({
    queryKey: ['movie-related', titleOrId],
    queryFn: () => getMovieRelatedContent(titleOrId),
    initialData: initialRelatedContent,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Watchlist mutations
  const addToWatchlistMutation = useMutation({
    mutationFn: () => addMovieToWatchlist(titleOrId),
    onSuccess: () => {
      setIsInWatchlist(true);
      queryClient.invalidateQueries({ queryKey: ['movie', titleOrId] });
    },
    onError: (error) => {
      console.error('Failed to add to watchlist:', error);
    }
  });

  const removeFromWatchlistMutation = useMutation({
    mutationFn: () => removeMovieFromWatchlist(titleOrId),
    onSuccess: () => {
      setIsInWatchlist(false);
      queryClient.invalidateQueries({ queryKey: ['movie', titleOrId] });
    },
    onError: (error) => {
      console.error('Failed to remove from watchlist:', error);
    }
  });

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const handleWatchMovie = () => {
    // Navigate to streaming page or show streaming modal
    navigate(`/movies/${encodeURIComponent(titleOrId)}/watch`);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const castMembers = castCrew.filter(member => member.role_type === 'actor');
  const crewMembers = castCrew.filter(member => member.role_type !== 'actor');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {movie.banner_url && (
          <div className="absolute inset-0 h-96">
            <img
              src={movie.banner_url}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
          </div>
        )}
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="outline" onClick={() => navigate(-1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Poster */}
            <div className="flex-shrink-0">
              {movie.poster_url ? (
                <img
                  src={movie.poster_url}
                  alt={movie.title}
                  className="w-64 h-96 object-cover rounded-lg shadow-lg"
                />
              ) : (
                <div className="w-64 h-96 bg-muted rounded-lg flex items-center justify-center">
                  <span className="text-muted-foreground">No Image</span>
                </div>
              )}
            </div>

            {/* Movie Info */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-4">
                {movie.is_featured && (
                  <Badge className="bg-primary text-primary-foreground">
                    Featured
                  </Badge>
                )}
                {formatDecimal(movie.imdb_rating, 1) && (
                  <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{formatDecimal(movie.imdb_rating, 1)}</span>
                  </div>
                )}
              </div>

              <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>

              <div className="flex flex-wrap gap-4 text-sm mb-6">
                {movie.release_year && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {movie.release_year}
                  </div>
                )}
                
                {movie.duration_minutes && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(movie.duration_minutes)}
                  </div>
                )}
                
                {movie.language && (
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    {movie.language}
                  </div>
                )}
              </div>

              {movie.genre && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {movie.genre.split(',').map((genre, index) => (
                    <Badge key={index} variant="secondary">
                      {genre.trim()}
                    </Badge>
                  ))}
                </div>
              )}

              {(movie.synopsis || movie.description) && (
                <p className="text-lg mb-6 leading-relaxed">
                  {movie.synopsis || movie.description}
                </p>
              )}

              <div className="flex gap-4">
                <Button size="lg" onClick={handleWatchMovie} className="gap-2">
                  <Play className="h-5 w-5" />
                  Watch Movie
                </Button>
                
                <Button 
                  variant="outline" 
                  size="lg" 
                  onClick={handleWatchlistToggle}
                  disabled={addToWatchlistMutation.isPending || removeFromWatchlistMutation.isPending}
                  className="gap-2"
                >
                  {isInWatchlist ? (
                    <>
                      <Check className="h-5 w-5" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <Plus className="h-5 w-5" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="cast">Cast & Crew</TabsTrigger>
            <TabsTrigger value="related">Related Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Movie Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {movie.director && (
                    <div>
                      <h4 className="font-semibold">Director</h4>
                      <p className="text-muted-foreground">{movie.director}</p>
                    </div>
                  )}
                  
                  {movie.producer && (
                    <div>
                      <h4 className="font-semibold">Producer</h4>
                      <p className="text-muted-foreground">{movie.producer}</p>
                    </div>
                  )}
                  
                  {movie.writer && (
                    <div>
                      <h4 className="font-semibold">Writer</h4>
                      <p className="text-muted-foreground">{movie.writer}</p>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  {movie.country && (
                    <div>
                      <h4 className="font-semibold">Country</h4>
                      <p className="text-muted-foreground">{movie.country}</p>
                    </div>
                  )}
                  
                  {movie.rating && (
                    <div>
                      <h4 className="font-semibold">Rating</h4>
                      <p className="text-muted-foreground">{movie.rating}</p>
                    </div>
                  )}
                  
                  {movie.box_office_gross && (
                    <div>
                      <h4 className="font-semibold">Box Office</h4>
                      <p className="text-muted-foreground">
                        {formatLargeCurrency(movie.box_office_gross)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="cast" className="space-y-6">
            {castMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cast
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {castMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          {member.character_name && (
                            <p className="text-sm text-muted-foreground">
                              as {member.character_name}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {crewMembers.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Crew</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {crewMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        {member.photo_url ? (
                          <img
                            src={member.photo_url}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-muted-foreground capitalize">
                            {member.role_type}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="related" className="space-y-6">
            {relatedContent.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {relatedContent.map((content) => (
                  <Card key={content.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        {content.thumbnail_url ? (
                          <img
                            src={content.thumbnail_url}
                            alt={content.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{content.title}</h4>
                          {content.author && (
                            <p className="text-sm text-muted-foreground mb-1">
                              by {content.author}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs">
                            {content.media_type}
                          </Badge>
                          {content.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {content.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No related content available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
