import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { 
  getMovies, 
  getFeaturedMovies, 
  getMovieByIdOrTitle,
  getMovieForStreaming,
  searchMovies,
  getMoviesByDirector,
  getMovieCastCrew,
  getMovieRelatedContent,
  addMovieToWatchlist,
  removeMovieFromWatchlist,
  updateMovieWatchProgress,
  createCompleteMovie
} from '~/services/movieService';
import { getVideoStatus, generateVideoAccess } from '~/services/videoService';
import { uploadPoster, uploadBanner, uploadThumbnail } from '~/services/mediaService';
import type { Movie, MovieSearchOptions, MovieSearchResult, CastCrewMember, RelatedContent } from '~/types/movie';

/**
 * Custom React Query hooks for movies, videos, and media
 */

// ============================================
// Movie Queries
// ============================================

export function useMovies(
  options: MovieSearchOptions = {},
  queryOptions?: Omit<UseQueryOptions<MovieSearchResult>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movies', options],
    queryFn: () => getMovies(options),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
}

export function useFeaturedMovies(
  limit: number = 10,
  queryOptions?: Omit<UseQueryOptions<Movie[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['featured-movies', limit],
    queryFn: () => getFeaturedMovies(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
}

export function useMovie(
  titleOrId: string | number,
  queryOptions?: Omit<UseQueryOptions<Movie>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movie', titleOrId],
    queryFn: () => getMovieByIdOrTitle(titleOrId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
}

export function useMovieStream(
  titleOrId: string | number,
  queryOptions?: Omit<UseQueryOptions<Movie>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movie-stream', titleOrId],
    queryFn: () => getMovieForStreaming(titleOrId),
    staleTime: 1000 * 60 * 4, // 4 minutes (signed URLs expire in 5)
    enabled: false, // Don't auto-fetch, only when explicitly called
    ...queryOptions,
  });
}

export function useMovieCastCrew(
  titleOrId: string | number,
  queryOptions?: Omit<UseQueryOptions<CastCrewMember[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movie-cast', titleOrId],
    queryFn: () => getMovieCastCrew(titleOrId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...queryOptions,
  });
}

export function useMovieRelatedContent(
  titleOrId: string | number,
  queryOptions?: Omit<UseQueryOptions<RelatedContent[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movie-related', titleOrId],
    queryFn: () => getMovieRelatedContent(titleOrId),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...queryOptions,
  });
}

export function useSearchMovies(
  query: string,
  limit: number = 20,
  queryOptions?: Omit<UseQueryOptions<Movie[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['search-movies', query, limit],
    queryFn: () => searchMovies(query, limit),
    enabled: query.length >= 2, // Only search if query is at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...queryOptions,
  });
}

export function useMoviesByDirector(
  director: string,
  limit: number = 20,
  queryOptions?: Omit<UseQueryOptions<Movie[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['movies-by-director', director, limit],
    queryFn: () => getMoviesByDirector(director, limit),
    staleTime: 1000 * 60 * 10, // 10 minutes
    ...queryOptions,
  });
}

// ============================================
// Movie Mutations
// ============================================

export function useAddToWatchlist(
  titleOrId: string | number,
  mutationOptions?: UseMutationOptions<any, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => addMovieToWatchlist(titleOrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', titleOrId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    ...mutationOptions,
  });
}

export function useRemoveFromWatchlist(
  titleOrId: string | number,
  mutationOptions?: UseMutationOptions<any, Error, void>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeMovieFromWatchlist(titleOrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', titleOrId] });
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
    ...mutationOptions,
  });
}

export function useUpdateWatchProgress(
  titleOrId: string | number,
  mutationOptions?: UseMutationOptions<any, Error, {
    videoId: number;
    progressPercentage: number;
    currentTimeSeconds?: number;
    totalTimeSeconds?: number;
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (progressData) => updateMovieWatchProgress(titleOrId, progressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie', titleOrId] });
      queryClient.invalidateQueries({ queryKey: ['watch-progress'] });
    },
    ...mutationOptions,
  });
}

export function useCreateMovie(
  mutationOptions?: UseMutationOptions<any, Error, {
    movieData: any;
    files: {
      video: File;
      poster?: File;
      banner?: File;
    };
  }>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ movieData, files }) => createCompleteMovie(movieData, files),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movies'] });
      queryClient.invalidateQueries({ queryKey: ['featured-movies'] });
    },
    ...mutationOptions,
  });
}

// ============================================
// Video Queries
// ============================================

export function useVideoStatus(
  videoId: string,
  queryOptions?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['video-status', videoId],
    queryFn: () => getVideoStatus(videoId),
    refetchInterval: (query) => {
      // Refetch every 5 seconds if video is still processing
      const data = query.state.data;
      if (data?.status === 'processing' || data?.status === 'pending') {
        return 5000;
      }
      return false; // Stop refetching when completed or failed
    },
    staleTime: 1000 * 30, // 30 seconds
    ...queryOptions,
  });
}

// ============================================
// Video Mutations
// ============================================

export function useGenerateVideoAccess(
  videoId: string,
  mutationOptions?: UseMutationOptions<any, Error, { expiresIn?: number }>
) {
  return useMutation({
    mutationFn: ({ expiresIn = 300 }) => generateVideoAccess(videoId, expiresIn),
    ...mutationOptions,
  });
}

// ============================================
// Media Mutations
// ============================================

export function useUploadPoster(
  mutationOptions?: UseMutationOptions<any, Error, {
    file: File;
    contentId: string;
    contentType: string;
  }>
) {
  return useMutation({
    mutationFn: ({ file, contentId, contentType }) => 
      uploadPoster(file, contentId, contentType),
    ...mutationOptions,
  });
}

export function useUploadBanner(
  mutationOptions?: UseMutationOptions<any, Error, {
    file: File;
    contentId: string;
    contentType: string;
  }>
) {
  return useMutation({
    mutationFn: ({ file, contentId, contentType }) => 
      uploadBanner(file, contentId, contentType),
    ...mutationOptions,
  });
}

export function useUploadThumbnail(
  mutationOptions?: UseMutationOptions<any, Error, {
    file: File;
    contentId: string;
    contentType: string;
  }>
) {
  return useMutation({
    mutationFn: ({ file, contentId, contentType }) => 
      uploadThumbnail(file, contentId, contentType),
    ...mutationOptions,
  });
}
