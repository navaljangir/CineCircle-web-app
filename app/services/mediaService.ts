import { post } from "~/api/api";
import { ENDPOINTS } from "~/lib/endpoints";

/**
 * Media Service
 * Handles image uploads and processing
 */

export interface ImageUploadResult {
  posterUrl?: string;
  bannerUrl?: string;
  thumbnailUrl?: string;
  thumbnailSmallUrl?: string;
  format: string;
  contentId: string;
  contentType: string;
}

export interface ResponsiveImageResult {
  responsiveSizes: {
    sm: { url: string; width: number; height: number };
    md: { url: string; width: number; height: number };
    lg: { url: string; width: number; height: number };
  };
  contentId: string;
  contentType: string;
}

export interface BatchUploadResult {
  message: string;
  jobs: Array<{
    jobId: string;
    filename: string;
    r2Key: string;
  }>;
}

export interface JobStatus {
  jobId: string;
  state: string;
  progress: number;
  result?: any;
}

/**
 * Upload poster image
 */
export async function uploadPoster(
  file: File,
  contentId: string,
  contentType: string,
  request?: Request
) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('contentId', contentId);
  formData.append('contentType', contentType);

  const response = await post<ImageUploadResult>({
    url: ENDPOINTS.UPLOAD_POSTER,
    body: formData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Upload banner image
 */
export async function uploadBanner(
  file: File,
  contentId: string,
  contentType: string,
  request?: Request
) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('contentId', contentId);
  formData.append('contentType', contentType);

  const response = await post<ImageUploadResult>({
    url: ENDPOINTS.UPLOAD_BANNER,
    body: formData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Upload thumbnail image
 */
export async function uploadThumbnail(
  file: File,
  contentId: string,
  contentType: string,
  request?: Request
) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('contentId', contentId);
  formData.append('contentType', contentType);

  const response = await post<ImageUploadResult>({
    url: ENDPOINTS.UPLOAD_THUMBNAIL,
    body: formData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Upload responsive image (generates multiple sizes)
 */
export async function uploadResponsiveImage(
  file: File,
  contentId: string,
  contentType: string,
  request?: Request
) {
  const formData = new FormData();
  formData.append('image', file);
  formData.append('contentId', contentId);
  formData.append('contentType', contentType);

  const response = await post<ResponsiveImageResult>({
    url: ENDPOINTS.UPLOAD_RESPONSIVE,
    body: formData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Process multiple images in batch
 */
export async function processBatchImages(
  files: File[],
  contentId: string,
  contentType: string,
  request?: Request
) {
  const formData = new FormData();
  
  files.forEach(file => {
    formData.append('images', file);
  });
  
  formData.append('contentId', contentId);
  formData.append('contentType', contentType);

  const response = await post<BatchUploadResult>({
    url: ENDPOINTS.PROCESS_BATCH_IMAGES,
    body: formData,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}

/**
 * Get image processing job status
 */
export async function getImageJobStatus(
  jobId: string,
  request?: Request
) {
  const response = await post<JobStatus>({
    url: `${ENDPOINTS.GET_IMAGE_JOB_STATUS}/${jobId}`,
    useAuth: true,
    fetchRequest: request,
  });
  
  return response.data;
}
