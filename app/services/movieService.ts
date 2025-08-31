/**
 * Legacy Movie Service - DEPRECATED
 * 
 * This service has been deprecated. Please use the following services instead:
 * - seriesService.ts for series-related functionality
 * - contentService.ts for content-related functionality
 * 
 * This file is kept for backward compatibility only.
 */

// Re-export from new services for backward compatibility
export { 
  getFeaturedSeries as getSeries,
  getSeriesById as getMovieById,
  getAllSeries
} from './seriesService';

export {
  searchContent as searchMovies,
  addToWatchlist,
  removeFromWatchlist,
  updateWatchProgress
} from './contentService';
