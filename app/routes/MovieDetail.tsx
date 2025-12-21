import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { VideoPlayer } from "~/components/VideoPlayer";
import {
  Plus, 
  Check, 
  Star, 
  Calendar, 
  Clock, 
  Globe, 
  User,
  BookOpen,
  Loader2,
  Play
} from "lucide-react";
import { 
  getMovieByIdOrTitle,
  getMovieForStreaming,
  getMovieCastCrew,
  getMovieRelatedContent,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  updateMovieWatchProgress
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
  const [showPlayer, setShowPlayer] = useState(false);
  const [streamingData, setStreamingData] = useState<any>(null);

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

  // Fetch streaming data when play button is clicked
  const {
    data: streamingDataResponse,
    isLoading: streamingLoading,
    refetch: refetchStreaming
  } = useQuery({
    queryKey: ['movie-stream', titleOrId],
    queryFn: () => getMovieForStreaming(titleOrId),
    enabled: false, // Don't auto-fetch
    staleTime: 1000 * 60 * 4, // 4 minutes (signed URLs expire in 5 minutes)
  });

  // Update streaming data when response changes
  useEffect(() => {
    if (streamingDataResponse) {
      console.log('Streaming data response:', streamingDataResponse);
      console.log('Playlist URL:', streamingDataResponse.playlist_url);
      console.log('Thumbnail URL:', streamingDataResponse.thumbnail_url);
      setStreamingData(streamingDataResponse);
      setShowPlayer(true);
    }
  }, [streamingDataResponse]);

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

  // Watch progress mutation
  const progressMutation = useMutation({
    mutationFn: (progressData: {
      videoId: number;
      progressPercentage: number;
      currentTimeSeconds?: number;
      totalTimeSeconds?: number;
    }) => updateMovieWatchProgress(titleOrId, progressData),
    onError: (error) => {
      console.error('Failed to update watch progress:', error);
    }
  });

  const handleWatchlistToggle = () => {
    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate();
    } else {
      addToWatchlistMutation.mutate();
    }
  };

  const handlePlayClick = async () => {
    await refetchStreaming();
  };

  const handleProgress = (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => {
    // Update progress every 10 seconds
    if (streamingData?.videos?.[0]?.id && progress.playedSeconds % 10 < 1) {
      progressMutation.mutate({
        videoId: streamingData.videos[0].id,
        progressPercentage: progress.played * 100,
        currentTimeSeconds: progress.playedSeconds,
        totalTimeSeconds: streamingData.videos[0].duration_seconds || 0
      });
    }
  };

  const castMembers = castCrew.filter(member => member.role_type === 'actor');
  const crewMembers = castCrew.filter(member => member.role_type !== 'actor');

  return (
    <div className="min-h-screen bg-background">
      {/* Main Grid Layout */}
      <div className="grid grid-cols-3 h-screen p-4 gap-4">
        {/* Movie Player Section - spans 2 columns */}
        <div className="col-span-2 relative bg-black rounded-xl overflow-hidden">
          {/* Video Player or Thumbnail */}
          {showPlayer && streamingData?.playlist_url ? (
            <VideoPlayer
              playlistUrl={streamingData.playlist_url}
              thumbnailUrl={streamingData.thumbnail_url || movie.banner_url || movie.poster_url}
              title={movie.title}
              className="h-full"
              onProgress={handleProgress}
              autoPlay
            />
          ) : (
            <div className="relative h-full">
              {/* Thumbnail */}
              <img
                src={movie.banner_url || movie.poster_url}
                alt={movie.title}
                className="w-full h-full object-cover rounded-xl"
              />
              
              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <Button
                  size="lg"
                  onClick={handlePlayClick}
                  disabled={streamingLoading}
                  className="h-20 w-20 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm border-2 border-white/50"
                >
                  {streamingLoading ? (
                    <Loader2 className="w-10 h-10 text-white animate-spin" />
                  ) : (
                    <Play className="w-10 h-10 text-white ml-1" />
                  )}
                </Button>
              </div>

              {/* Cast and Crew Scrolling Overlay */}
              <div className="absolute right-6 top-1/2 transform -translate-y-1/2 w-80 max-h-96 overflow-y-auto bg-black/70 backdrop-blur-sm rounded-lg p-4">
                <div className="space-y-4">
                  {castMembers.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Cast
                      </h3>
                      <div className="space-y-2">
                        {castMembers.slice(0, 6).map((member) => (
                          <div key={member.id} className="flex items-center gap-2">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{member.name}</p>
                              {member.character_name && (
                                <p className="text-gray-300 text-xs truncate">
                                  as {member.character_name}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {crewMembers.length > 0 && (
                    <div>
                      <h3 className="text-white font-semibold mb-2">Crew</h3>
                      <div className="space-y-2">
                        {crewMembers.slice(0, 4).map((member) => (
                          <div key={member.id} className="flex items-center gap-2">
                            {member.photo_url ? (
                              <img
                                src={member.photo_url}
                                alt={member.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-300" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{member.name}</p>
                              <p className="text-gray-300 text-xs capitalize truncate">
                                {member.role_type}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Movie Info Overlay - Bottom Left */}
              <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/90 via-black/70 to-transparent text-white rounded-b-xl">
                <div className="max-w-3xl">
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

                  <div className="flex flex-wrap gap-4 text-sm mb-4">
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
                    <div className="flex flex-wrap gap-2 mb-4">
                      {movie.genre.split(',').map((genre, index) => (
                        <Badge key={index} variant="secondary">
                          {genre.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {(movie.synopsis || movie.description) && (
                    <p className="text-lg mb-4 leading-relaxed line-clamp-3">
                      {movie.synopsis || movie.description}
                    </p>
                  )}

                  <div className="flex gap-4">
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
          )}
        </div>

        {/* Right Sidebar - spans 1 column */}
        <div className="col-span-1 bg-muted/30 rounded-xl overflow-y-auto">
          <div className="p-6 space-y-6">
            <h2 className="text-2xl font-bold">Movie Details</h2>
            
            {/* Movie Details */}
            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  {movie.director && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Director</h4>
                      <p className="text-base font-medium">{movie.director}</p>
                    </div>
                  )}
                  
                  {movie.producer && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Producer</h4>
                      <p className="text-base font-medium">{movie.producer}</p>
                    </div>
                  )}
                  
                  {movie.writer && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Writer</h4>
                      <p className="text-base font-medium">{movie.writer}</p>
                    </div>
                  )}

                  {movie.country && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Country</h4>
                      <p className="text-base font-medium">{movie.country}</p>
                    </div>
                  )}
                  
                  {movie.rating && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Rating</h4>
                      <p className="text-base font-medium">{movie.rating}</p>
                    </div>
                  )}
                  
                  {movie.box_office_gross && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">Box Office</h4>
                      <p className="text-base font-medium">
                        {formatLargeCurrency(movie.box_office_gross)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Content Section */}
            {relatedContent.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Related Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {relatedContent.map((content) => (
                      <div key={content.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                        {content.thumbnail_url ? (
                          <img
                            src={content.thumbnail_url}
                            alt={content.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <BookOpen className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1 line-clamp-1">{content.title}</h4>
                          {content.author && (
                            <p className="text-xs text-muted-foreground mb-1">
                              by {content.author}
                            </p>
                          )}
                          <Badge variant="outline" className="text-xs mb-1">
                            {content.media_type}
                          </Badge>
                          {content.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {content.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Related Movies Section - Full width with padding */}
      <div className="px-8 py-12 bg-background">
        <h2 className="text-3xl font-bold mb-8">You might also like</h2>
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <p className="text-xl text-muted-foreground mb-2">Related movies coming soon</p>
            <p className="text-sm text-muted-foreground">
              We're working on building recommendations based on this movie
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
