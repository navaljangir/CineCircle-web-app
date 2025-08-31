import type { User } from './auth';

// Legacy Movie types - deprecated in favor of Series and Content
// Keeping for backward compatibility only
export interface Movie {
  id: number;
  title: string;
  description?: string;
  genre: string;
  year: number;
  duration: number;
  poster_url?: string;
  trailer_url?: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: number;
  movie: Movie;
  user_id: number;
  progress: number;
  created_at: string;
  updated_at: string;
}
