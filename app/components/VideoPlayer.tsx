import { useRef, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Hls from 'hls.js';
import { cn } from '~/lib/utils';
import  api  from '~/api/api';

interface VideoPlayerProps {
  playlistUrl: string;
  thumbnailUrl?: string;
  title: string;
  className?: string;
  onProgress?: (progress: { played: number; playedSeconds: number; loaded: number; loadedSeconds: number }) => void;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export function VideoPlayer({
  playlistUrl,
  thumbnailUrl,
  title,
  className,
  onProgress,
  onEnded,
  autoPlay = false
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [authError, setAuthError] = useState(false);

  // Use React Query to fetch playlist with auth - automatically handles token refresh
  const { data: playlistData, isError, error, refetch } = useQuery({
    queryKey: ['video-playlist', playlistUrl],
    queryFn: async () => {
      const absoluteUrl = playlistUrl.startsWith('http') 
        ? playlistUrl 
        : `${window.location.origin}${playlistUrl}`;
      
      const response = await api.get({ 
        url: playlistUrl,
        useAuth: true 
      });
      return {
        content: response.data,
        url: absoluteUrl
      };
    },
    retry: (failureCount, error: any) => {
      // Retry on network errors, but not on 401/403 (auth issues)
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        setAuthError(true);
        return false;
      }
      return failureCount < 3;
    },
    staleTime: 1000 * 60 * 4, // 4 minutes (signed URLs expire in 5 minutes)
    refetchOnWindowFocus: false,
  });
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playlistData) return;

    const absolutePlaylistUrl = playlistData.url;

    // Check if HLS.js is supported
    if (Hls.isSupported()) {
      const hls = new Hls({
        debug: false,
        enableWorker: true,
        xhrSetup: function(xhr, url) {
          // Add auth token for API requests
          if (url.includes('/api/v1/movies/')) {
            const token = localStorage.getItem('token');
            if (token) {
              xhr.setRequestHeader('Authorization', `Bearer ${token}`);
            }
          }
        }
      });

      hlsRef.current = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (autoPlay) {
          video.play().catch(() => {
            // Autoplay failed - user interaction required
          });
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              // Check if it's an auth error (401/403)
              if (data.response?.code === 401 || data.response?.code === 403) {
                setAuthError(true);
                refetch();
              } else {
                hls.startLoad();
              }
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              break;
          }
        }
      });

      hls.loadSource(absolutePlaylistUrl);
      hls.attachMedia(video);

    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari which has native HLS support
      video.src = absolutePlaylistUrl;
      
      if (autoPlay) {
        video.play().catch(() => {
          // Autoplay failed - user interaction required
        });
      }
    }

    // Cleanup
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [playlistData, autoPlay, refetch]);

  // Progress tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    const handleTimeUpdate = () => {
      const played = video.currentTime / video.duration;
      const loaded = video.buffered.length > 0 
        ? video.buffered.end(video.buffered.length - 1) / video.duration 
        : 0;

      onProgress({
        played: isNaN(played) ? 0 : played,
        playedSeconds: video.currentTime,
        loaded: isNaN(loaded) ? 0 : loaded,
        loadedSeconds: video.buffered.length > 0 
          ? video.buffered.end(video.buffered.length - 1) 
          : 0
      });
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [onProgress]);

  // Show loading state while fetching playlist
  if (!playlistData && !isError) {
    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden flex items-center justify-center', className)}>
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading video...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError || authError) {
    return (
      <div className={cn('relative bg-black rounded-xl overflow-hidden flex items-center justify-center', className)}>
        <div className="text-white text-center p-8">
          <p className="text-xl mb-4">
            {authError ? '🚫 Authentication required' : '❌ Failed to load video'}
          </p>
          <p className="text-sm text-gray-400 mb-4">
            {error?.message || 'Please check your connection and try again'}
          </p>
          <button
            onClick={() => {
              setAuthError(false);
              refetch();
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative bg-black rounded-xl overflow-hidden', className)}>
      <div className="relative w-full h-full">
        <video
          ref={videoRef}
          className="w-full h-full"
          controls
          onEnded={onEnded}
        >
          Your browser does not support the video tag or HLS playback.
        </video>
      </div>
    </div>
  );
}
