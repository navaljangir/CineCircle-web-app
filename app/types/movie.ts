import type { User } from './auth';

// Movie interfaces based on the backend API
export interface Movie {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  director?: string;
  producer?: string;
  writer?: string;
  poster_url?: string;
  banner_url?: string;
  release_year?: number;
  release_date?: string;
  duration_minutes?: number;
  language?: string;
  country?: string;
  genre?: string;
  rating?: string;
  imdb_rating?: number;
  rotten_tomatoes_score?: number;
  box_office_gross?: number;
  budget?: number;
  awards?: string;
  synopsis?: string;
  trivia?: string;
  is_featured: boolean;
  is_active: boolean;
  metadata?: any;
  created_at: string;
  updated_at: string;
  
  // Additional data when user is authenticated
  isInWatchlist?: boolean;
  watchProgress?: MovieWatchProgress;
  
  // Related data
  castCrew?: CastCrewMember[];
  relatedContent?: RelatedContent[];
  videos?: MovieVideo[];
}

export interface MovieVideo {
  id: number;
  uuid: string;
  title?: string;
  video_type: string;
  streaming_url: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  resolution?: string;
  processing_status: string;
  is_primary: boolean;
  quality_variants?: any;
  subtitles?: any;
}

export interface CastCrewMember {
  id: number;
  name: string;
  biography?: string;
  photo_url?: string;
  date_of_birth?: string;
  place_of_birth?: string;
  nationality?: string;
  notable_works?: string;
  role_type: 'actor' | 'director' | 'producer' | 'writer' | 'other';
  character_name?: string;
  billing_order?: number;
  is_lead: boolean;
}

export interface RelatedContent {
  id: number;
  uuid: string;
  title: string;
  description?: string;
  author?: string;
  media_type: string;
  content_url?: string;
  thumbnail_url?: string;
  publisher?: string;
  publication_date?: string;
  language?: string;
  is_featured: boolean;
  is_active: boolean;
}

export interface MovieWatchProgress {
  progress_percentage: number;
  current_time_seconds?: number;
  total_time_seconds?: number;
  last_watched_at: string;
  video_id?: number;
}

export interface MovieSearchOptions {
  page?: number;
  limit?: number;
  director?: string;
  language?: string;
  country?: string;
  genre?: string;
  releaseYear?: number;
  minRating?: number;
  search?: string;
  isFeatured?: boolean;
  isActive?: boolean;
}

export interface MovieSearchResult {
  movies: Movie[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface WatchlistItem {
  id: number;
  movie: Movie;
  user_id: number;
  progress: number;
  created_at: string;
  updated_at: string;
}

// Legacy types for backward compatibility
export interface OldMovie {
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
