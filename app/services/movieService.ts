import { get, post, put, deleteRequest } from "~/lib/api";
import { ENDPOINTS } from "~/lib/endpoints";
import type { Movie, MovieComment, WatchlistItem } from "~/types/movie";
import type { PaginatedResponse } from "~/types/api";

/**
 * Movie Services
 */

// Get all movies with filtering and pagination
export async function getMovies(
  options: {
    page?: number;
    limit?: number;
    genre?: number;
    year?: number;
    rating?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
  } = {},
  request?: Request
) {
  const response = await get<PaginatedResponse<Movie>>({
    url: ENDPOINTS.GET_MOVIES,
    query: options,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get movie by ID
export async function getMovieById(movieId: number, request?: Request) {
  const response = await get<Movie>({
    url: `${ENDPOINTS.GET_MOVIE_BY_ID}/${movieId}`,
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Search movies
export async function searchMovies(
  query: string,
  filters: {
    genre?: number;
    year?: number;
    rating?: number;
    page?: number;
    limit?: number;
  } = {},
  request?: Request
) {
  const response = await get<Movie[]>({
    url: ENDPOINTS.SEARCH_MOVIES,
    query: { q: query, ...filters },
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Rate a movie
export async function rateMovie(movieId: number, rating: number, request?: Request) {
  const response = await post<{ message: string; averageRating: number }>({
    url: `${ENDPOINTS.RATE_MOVIE}/${movieId}/rate`,
    body: { rating },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Add comment to movie
export async function addMovieComment(movieId: number, content: string, request?: Request) {
  const response = await post<MovieComment>({
    url: `${ENDPOINTS.ADD_MOVIE_COMMENT}/${movieId}/comment`,
    body: { content },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Add movie to watchlist
export async function addToWatchlist(movieId: number, request?: Request) {
  const response = await post<WatchlistItem>({
    url: `${ENDPOINTS.ADD_TO_WATCHLIST}/${movieId}/watchlist`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Remove movie from watchlist
export async function removeFromWatchlist(movieId: number, request?: Request) {
  const response = await deleteRequest<{ message: string }>({
    url: `${ENDPOINTS.REMOVE_FROM_WATCHLIST}/${movieId}/watchlist`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Update watch progress
export async function updateWatchProgress(movieId: number, progress: number, request?: Request) {
  const response = await put<WatchlistItem>({
    url: `${ENDPOINTS.UPDATE_WATCH_PROGRESS}/${movieId}/progress`,
    body: { progress },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get user's watchlist
export async function getUserWatchlist(
  options: { page?: number; limit?: number } = {},
  request?: Request
) {
  const response = await get<PaginatedResponse<WatchlistItem>>({
    url: ENDPOINTS.GET_USER_WATCHLIST,
    query: options,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Get user's watch history
export async function getWatchHistory(
  options: { page?: number; limit?: number } = {},
  request?: Request
) {
  const response = await get<PaginatedResponse<WatchlistItem>>({
    url: ENDPOINTS.GET_WATCH_HISTORY,
    query: options,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}
