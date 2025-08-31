import type { User } from './auth';

// Content types based on the new backend structure
export interface Content {
  id: number;
  title: string;
  description?: string;
  contentType: ContentType;
  status: VideoStatus;
  seriesId?: number;
  episodeNumber?: number;
  season?: number;
  duration?: number;
  poster_url?: string;
  video_url?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
  
  // User-specific data (when user is logged in)
  isInWatchlist?: boolean;
  watchProgress?: WatchProgress;
}

export interface WatchProgress {
  id: number;
  user_id: number;
  content_item_id: number;
  progress_seconds: number;
  total_duration_seconds: number;
  progress_percentage: number;
  completed: boolean;
  last_watched_at: string;
  created_at: string;
  updated_at: string;
}

export interface WatchlistItem {
  id: number;
  user_id: number;
  content_item_id: number;
  content: Content;
  created_at: string;
  updated_at: string;
}

export interface ContentSearchResult {
  id: number;
  title: string;
  description?: string;
  contentType: ContentType;
  poster_url?: string;
  seriesId?: number;
  episodeNumber?: number;
  season?: number;
}

// Content type enum
export enum ContentType {
  MOVIE = 'movie',
  EPISODE = 'episode',
  DOCUMENTARY = 'documentary',
  SHORT = 'short'
}

// Video status enum  
export enum VideoStatus {
  DRAFT = 'draft',
  PROCESSING = 'processing',
  READY = 'ready',
  FAILED = 'failed',
  ARCHIVED = 'archived'
}

// Admin-specific types
export interface VideoMetadata {
  title: string;
  description?: string;
  contentType: ContentType;
  seriesId?: number;
  episodeNumber?: number;
  season?: number;
  status: VideoStatus;
  tags?: string[];
}

export interface UploadStatistics {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  totalSize: string;
  averageProcessingTime: string;
  uploadsByType: Record<string, number>;
  dailyUploads: Array<{
    date: string;
    count: number;
  }>;
  timeframe: string;
}

export interface ModerationResult {
  videoId: string;
  action: 'approve' | 'reject' | 'flag';
  reason: string;
  moderatedBy: number;
  moderatedAt: string;
  status: string;
}
