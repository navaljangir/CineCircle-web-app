import { get, post, put, deleteRequest } from "~/api/api";
import { ENDPOINTS } from "~/lib/endpoints";
import type { 
  Content, 
  WatchProgress, 
  WatchlistItem, 
  ContentSearchResult,
  VideoMetadata,
  UploadStatistics,
  ModerationResult
} from "~/types/content";
import type { PaginatedResponse } from "~/types/api";

/**
 * Content Services
 */

// Get content by ID with user-specific data
export async function getContentById(contentId: number, request?: Request) {
  const response = await get<Content>({
    url: `${ENDPOINTS.GET_CONTENT_BY_ID}/${contentId}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Quick search content
export async function quickSearchContent(
  query: string,
  request?: Request
) {
  const response = await get<ContentSearchResult[]>({
    url: ENDPOINTS.SEARCH_CONTENT,
    query: { q: query },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Search content (for full search functionality)
export async function searchContent(
  query: string,
  options: {
    page?: number;
    limit?: number;
  } = {},
  request?: Request
) {
  const response = await get<ContentSearchResult[]>({
    url: ENDPOINTS.SEARCH_CONTENT,
    query: { q: query, ...options },
    useAuth: false,
    fetchRequest: request,
  });
  
  return response.data;
}

// Add content to watchlist
export async function addToWatchlist(contentId: number, request?: Request) {
  const response = await post<WatchlistItem>({
    url: `${ENDPOINTS.ADD_TO_WATCHLIST}/${contentId}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Remove content from watchlist
export async function removeFromWatchlist(contentId: number, request?: Request) {
  const response = await deleteRequest<{ message: string }>({
    url: `${ENDPOINTS.REMOVE_FROM_WATCHLIST}/${contentId}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Update watch progress
export async function updateWatchProgress(
  contentId: number,
  progressData: {
    progress_seconds: number;
    total_duration_seconds: number;
    completed?: boolean;
  },
  request?: Request
) {
  const response = await put<WatchProgress>({
    url: `${ENDPOINTS.UPDATE_WATCH_PROGRESS}/${contentId}`,
    body: progressData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

// Admin functions
export async function getAllVideos(
  options: {
    page?: number;
    limit?: number;
    status?: string;
    contentType?: string;
  } = {},
  request?: Request
) {
  const response = await get<PaginatedResponse<Content>>({
    url: ENDPOINTS.GET_ALL_VIDEOS,
    query: options,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

export async function updateVideoMetadata(
  videoId: string,
  updateData: Partial<VideoMetadata>,
  request?: Request
) {
  const response = await put<Content>({
    url: `${ENDPOINTS.UPDATE_VIDEO_METADATA}/${videoId}`,
    body: updateData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

export async function deleteVideo(videoId: string, request?: Request) {
  const response = await deleteRequest<{ message: string }>({
    url: `${ENDPOINTS.DELETE_VIDEO}/${videoId}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

export async function moderateVideo(
  videoId: string,
  action: 'approve' | 'reject' | 'flag',
  reason: string,
  request?: Request
) {
  const response = await post<ModerationResult>({
    url: `${ENDPOINTS.MODERATE_VIDEO}/${videoId}`,
    body: { action, reason },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

export async function getUploadStatistics(
  timeframe: string = '30d',
  request?: Request
) {
  const response = await get<UploadStatistics>({
    url: ENDPOINTS.GET_UPLOAD_STATS,
    query: { timeframe },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}
