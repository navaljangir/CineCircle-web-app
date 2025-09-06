import type { User } from './auth';
import type { Content } from './content';

// Movie interface for series content
export interface Movie {
  id: number;
  title: string;
  poster_url?: string;
  release_year?: number;
  duration_minutes?: number;
  genre?: string;
  imdb_rating?: number;
  synopsis?: string;
}

// Series types
export interface Series {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  banner_url?: string;
  series_type?: string;
  created_at?: string;
  updated_at?: string;
  partner_name?: string;
  movies?: Movie[];
}

export interface Partner {
  id: number;
  name: string;
  logo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface FeaturedSeries {
  id: number;
  title: string;
  description?: string;
  image_url?: string;
  series_type?: string;
  partner_name: string;
}
