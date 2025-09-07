import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { useLoaderData, useNavigate, Link } from "react-router";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Settings,
  SkipBack,
  SkipForward
} from "lucide-react";
import { getMovieForStreaming, updateMovieWatchProgress } from "~/services/movieService";
import type { Movie } from "~/types/movie";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const movie = data?.movie;
  return [
    { title: movie ? `Watch ${movie.title} - CineCircle` : "Movie Not Found - CineCircle" },
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
    const movie = await getMovieForStreaming(titleOrId, request);

    if (!movie) {
      throw new Response("Movie not found", { status: 404 });
    }

    if (!movie.videos || movie.videos.length === 0) {
      throw new Response("No videos available for this movie", { status: 404 });
    }

    return { movie, titleOrId };
  } catch (error) {
    throw new Response("Movie not found or not available for streaming", { status: 404 });
  }
}

export default function MovieWatch() {
  const { movie: initialMovie, titleOrId } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Fetch movie streaming data with React Query
  const {
    data: movie = initialMovie,
    isLoading: movieLoading
  } = useQuery({
    queryKey: ['movie-stream', titleOrId],
    queryFn: () => getMovieForStreaming(titleOrId),
    initialData: initialMovie,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(movie.videos?.[0] || movie.videos![0]);
  
  // Progress tracking
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);

  // Progress update mutation
  const updateProgressMutation = useMutation({
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

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      
      // Update progress every 10 seconds
      if (video.currentTime - lastProgressUpdate > 10) {
        updateProgress();
        setLastProgressUpdate(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      
      // Resume from last watched position if available
      if (movie.watchProgress?.current_time_seconds) {
        video.currentTime = movie.watchProgress.current_time_seconds;
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [movie.watchProgress, lastProgressUpdate]);

  const updateProgress = () => {
    const video = videoRef.current;
    if (!video || !selectedVideo) return;

    const progressPercentage = (video.currentTime / video.duration) * 100;
    
    updateProgressMutation.mutate({
      videoId: selectedVideo.id,
      progressPercentage,
      currentTimeSeconds: video.currentTime,
      totalTimeSeconds: video.duration
    });
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (seekTime: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (newVolume: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;

    if (!isFullscreen) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-black">
      {/* Video Player */}
      <div className="relative w-full h-screen flex items-center justify-center">
        <video
          ref={videoRef}
          src={selectedVideo.streaming_url}
          className="w-full h-full object-contain"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => {
            setIsPlaying(false);
            updateProgress();
          }}
        />

        {/* Video Controls Overlay */}
        <div 
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            showControls ? 'opacity-100' : 'opacity-0'
          }`}
          onMouseMove={() => setShowControls(true)}
          onMouseLeave={() => setShowControls(false)}
        >
          {/* Top Controls */}
          <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
                className="text-white hover:bg-white/20"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <div className="text-white">
                <h1 className="text-xl font-semibold">{movie.title}</h1>
                {movie.release_year && (
                  <p className="text-sm opacity-80">{movie.release_year}</p>
                )}
              </div>
              
              <div />
            </div>
          </div>

          {/* Center Play Button */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={togglePlay}
                className="w-20 h-20 rounded-full bg-white/20 hover:bg-white/30 border-2 border-white"
              >
                <Play className="h-8 w-8 text-white ml-1" />
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
            {/* Progress Bar */}
            <div className="mb-4">
              <div className="w-full bg-white/30 rounded-full h-1 mb-2">
                <div 
                  className="bg-primary h-1 rounded-full transition-all duration-200"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-white text-sm">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSeek(Math.max(0, currentTime - 10))}
                  className="text-white hover:bg-white/20"
                >
                  <SkipBack className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSeek(Math.min(duration, currentTime + 10))}
                  className="text-white hover:bg-white/20"
                >
                  <SkipForward className="h-5 w-5" />
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/20"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20"
                >
                  <Settings className="h-5 w-5" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20"
                >
                  <Maximize className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Selection (if multiple videos) */}
      {movie.videos && movie.videos.length > 1 && (
        <div className="p-4 bg-gray-900">
          <h3 className="text-white text-lg font-semibold mb-4">Select Video</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {movie.videos.map((video) => (
              <Card 
                key={video.id}
                className={`cursor-pointer transition-all ${
                  selectedVideo.id === video.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedVideo(video)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    {video.thumbnail_url && (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title || `Video ${video.id}`}
                        className="w-16 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {video.title || `Video ${video.id}`}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        {video.resolution && (
                          <Badge variant="outline">{video.resolution}</Badge>
                        )}
                        {video.duration_seconds && (
                          <span>{formatTime(video.duration_seconds)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
