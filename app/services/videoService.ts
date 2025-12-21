import { get, post, put, deleteRequest } from "~/api/api";
import { ENDPOINTS } from "~/lib/endpoints";

/**
 * Video Service
 * Handles video upload, processing, and streaming
 */

export interface VideoStatus {
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'not_found';
  videoId: string;
  streamingUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  resolution?: string;
  progress?: number;
}

export interface VideoAccessToken {
  success: boolean;
  playlistUrl: string;
  thumbnailUrl: string;
  videoId: string;
  expiresIn: number;
  expiresAt: string;
  message: string;
}

export interface AdminVideo {
  id: number;
  uuid: string;
  title: string;
  videoType: number;
  processingStatus: number;
  streamingUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoStats {
  totalUploads: number;
  successfulUploads: number;
  failedUploads: number;
  totalSize: string;
  averageProcessingTime: string;
  uploadsByDay: Array<{ date: string; count: number }>;
  statusBreakdown: {
    completed: number;
    processing: number;
    failed: number;
    uploading: number;
  };
  timeframe: string;
}

/**
 * Get video processing status
 */
export async function getVideoStatus(
  videoId: string,
  request?: Request
) {
  const response = await get<VideoStatus>({
    url: `${ENDPOINTS.GET_VIDEO_STATUS}/${videoId}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Generate signed access URLs for video streaming
 */
export async function generateVideoAccess(
  videoId: string,
  expiresIn: number = 300,
  request?: Request
) {
  const response = await post<VideoAccessToken>({
    url: `${ENDPOINTS.GENERATE_VIDEO_ACCESS}/${videoId}`,
    body: { expiresIn },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Admin: Get all videos with filters
 */
export async function getAllVideosAdmin(
  options: {
    page?: number;
    limit?: number;
    status?: number;
    contentType?: number;
    userId?: number;
  } = {},
  request?: Request
) {
  const response = await get<{
    success: boolean;
    data: {
      videos: AdminVideo[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };
  }>({
    url: ENDPOINTS.GET_ALL_VIDEOS_ADMIN,
    query: options as Record<string, string | number | undefined>,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data.data;
}

/**
 * Admin: Update video metadata
 */
export async function updateVideoMetadata(
  videoId: string,
  updateData: {
    title?: string;
    description?: string;
    contentType?: number;
  },
  request?: Request
) {
  const response = await put<{ success: boolean; data: AdminVideo }>({
    url: `${ENDPOINTS.UPDATE_VIDEO_METADATA}/${videoId}/metadata`,
    body: updateData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data.data;
}

/**
 * Admin: Delete video
 */
export async function deleteVideo(
  videoId: string,
  request?: Request
) {
  const response = await deleteRequest<{ success: boolean; message: string }>({
    url: `${ENDPOINTS.DELETE_VIDEO}/${videoId}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Admin: Get video upload statistics
 */
export async function getVideoStats(
  timeframe: string = '30d',
  request?: Request
) {
  const response = await get<{ success: boolean; data: VideoStats }>({
    url: ENDPOINTS.GET_VIDEO_STATS,
    query: { timeframe },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data.data;
}

/**
 * Admin: Moderate video
 */
export async function moderateVideo(
  videoId: string,
  action: 'approve' | 'reject' | 'flag',
  reason: string,
  request?: Request
) {
  const response = await post<{
    success: boolean;
    data: {
      action: string;
      reason: string;
      moderatedBy: number;
      moderatedAt: string;
      status: string;
    };
  }>({
    url: `${ENDPOINTS.MODERATE_VIDEO}/${videoId}/moderate`,
    body: { action, reason },
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data.data;
}
