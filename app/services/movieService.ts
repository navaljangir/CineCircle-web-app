import { get, post, deleteRequest } from "~/api/api";
import { ENDPOINTS } from "~/lib/endpoints";
import type { 
  Movie, 
  MovieSearchOptions, 
  MovieSearchResult, 
  MovieWatchProgress,
  CastCrewMember,
  RelatedContent,
  WatchlistItem
} from "~/types/movie";

/**
 * Movie Services
 * Complete implementation for movie functionality
 */

// Get movies with pagination and filtering
export async function getMovies(
  options: MovieSearchOptions = {},
  request?: Request
) {
  const response = await get<MovieSearchResult>({
    url: ENDPOINTS.GET_MOVIES,
    query: options as Record<string, string | number | boolean | undefined>,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get featured movies
export async function getFeaturedMovies(
  limit: number = 10,
  request?: Request
) {
  const response = await get<Movie[]>({
    url: ENDPOINTS.GET_FEATURED_MOVIES,
    query: { limit },
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get movie by ID or title
export async function getMovieByIdOrTitle(
  titleOrId: string | number,
  request?: Request
) {
  const response = await get<Movie>({
    url: `${ENDPOINTS.GET_MOVIE_BY_TITLE_OR_ID}/${encodeURIComponent(titleOrId)}`,
    useAuth: true, // Optional auth to get user-specific data
    fetchRequest: request,
  });
  
  return response.data;
}

// Get movie with streaming information
export async function getMovieForStreaming(
  titleOrId: string | number,
  request?: Request
) {
  const response = await get<Movie>({
    url: `${ENDPOINTS.GET_MOVIE_STREAM}/${encodeURIComponent(titleOrId)}/stream`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get movie cast and crew
export async function getMovieCastCrew(
  titleOrId: string | number,
  request?: Request
) {
  const response = await get<CastCrewMember[]>({
    url: `${ENDPOINTS.GET_MOVIE_CAST}/${encodeURIComponent(titleOrId)}/cast`,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get related content for a movie
export async function getMovieRelatedContent(
  titleOrId: string | number,
  request?: Request
) {
  const response = await get<RelatedContent[]>({
    url: `${ENDPOINTS.GET_MOVIE_RELATED}/${encodeURIComponent(titleOrId)}/related`,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Search movies
export async function searchMovies(
  query: string,
  limit: number = 20,
  request?: Request
) {
  const response = await get<Movie[]>({
    url: ENDPOINTS.SEARCH_MOVIES,
    query: { q: query, limit },
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get movies by director
export async function getMoviesByDirector(
  director: string,
  limit: number = 20,
  request?: Request
) {
  const response = await get<Movie[]>({
    url: `${ENDPOINTS.GET_MOVIES_BY_DIRECTOR}/${encodeURIComponent(director)}`,
    query: { limit },
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Add movie to watchlist
export async function addMovieToWatchlist(
  titleOrId: string | number,
  request?: Request
) {
  const response = await post<WatchlistItem>({
    url: `${ENDPOINTS.ADD_MOVIE_TO_WATCHLIST}/${encodeURIComponent(titleOrId)}/watchlist`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Remove movie from watchlist
export async function removeMovieFromWatchlist(
  titleOrId: string | number,
  request?: Request
) {
  const response = await deleteRequest<{ message: string }>({
    url: `${ENDPOINTS.REMOVE_MOVIE_FROM_WATCHLIST}/${encodeURIComponent(titleOrId)}/watchlist`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Update movie watch progress
export async function updateMovieWatchProgress(
  titleOrId: string | number,
  progressData: {
    videoId: number;
    progressPercentage: number;
    currentTimeSeconds?: number;
    totalTimeSeconds?: number;
  },
  request?: Request
) {
  const response = await post<MovieWatchProgress>({
    url: `${ENDPOINTS.UPDATE_MOVIE_PROGRESS}/${encodeURIComponent(titleOrId)}/progress`,
    body: progressData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Create complete movie (with video, poster, banner)
export async function createCompleteMovie(
  movieData: {
    title: string;
    description?: string;
    director?: string;
    producer?: string;
    writer?: string;
    releaseYear?: number;
    releaseDate?: string;
    durationMinutes?: number;
    language?: string;
    country?: string;
    genre?: string;
    rating?: string;
    imdbRating?: number;
    rottenTomatoesScore?: number;
    boxOfficeGross?: string;
    budget?: string;
    awards?: string;
    synopsis?: string;
    trivia?: string;
    isFeatured?: boolean;
    seriesId?: number;
    episodeNumber?: number;
    season?: number;
  },
  files: {
    video: File;
    poster?: File;
    banner?: File;
  },
  request?: Request
) {
  const formData = new FormData();
  
  // Add video file
  formData.append('video', files.video);
  
  // Add poster if provided
  if (files.poster) {
    formData.append('poster', files.poster);
  }
  
  // Add banner if provided
  if (files.banner) {
    formData.append('banner', files.banner);
  }
  
  // Add all movie metadata
  Object.entries(movieData).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  const response = await post<{
    movie: any;
    video: {
      videoId: string;
      jobId: string;
      status: string;
      message: string;
    };
    images: {
      posterUrl?: string;
      thumbnailUrl?: string;
      bannerUrl?: string;
    };
    nextSteps: string[];
  }>({
    url: ENDPOINTS.CREATE_COMPLETE_MOVIE,
    body: formData as any,
    formData: true,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Legacy exports for backward compatibility
export { 
  getFeaturedMovies as getSeries,
  getMovieByIdOrTitle as getMovieById,
  getMovies as getAllSeries
};

// Re-export content service functions for legacy compatibility
export {
  searchContent as searchContentLegacy,
  addToWatchlist as addToWatchlistLegacy,
  removeFromWatchlist as removeFromWatchlistLegacy,
  updateWatchProgress as updateWatchProgressLegacy
} from './contentService';
