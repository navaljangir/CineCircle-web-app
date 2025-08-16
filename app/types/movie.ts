import type { User } from './auth';

// Movie types
export interface Movie {
  id: number;
  title: string;
  description?: string;
  genre: string;
  year: number;
  rating: number;
  duration: number;
  poster_url?: string;
  trailer_url?: string;
  created_at: string;
  updated_at: string;
}

export interface MovieComment {
  id: number;
  content: string;
  user: User;
  movie_id: number;
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
