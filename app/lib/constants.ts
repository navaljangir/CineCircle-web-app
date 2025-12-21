export const METHOD = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

export const PLATFORM = {
  WEB: 0,
  MOBILE: 1,
  DESKTOP: 2,
} as const;

export const HTTP_CODE = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

export const AUTH_COOKIE = 'auth_token';

// Video Processing Status
export const VIDEO_PROCESSING_STATUS = {
  PENDING: 1,
  PROCESSING: 2,
  COMPLETED: 3,
  FAILED: 4,
} as const;

export const VIDEO_PROCESSING_STATUS_LABELS = {
  [VIDEO_PROCESSING_STATUS.PENDING]: 'Pending',
  [VIDEO_PROCESSING_STATUS.PROCESSING]: 'Processing',
  [VIDEO_PROCESSING_STATUS.COMPLETED]: 'Completed',
  [VIDEO_PROCESSING_STATUS.FAILED]: 'Failed',
} as const;

// Content Media Types
export const CONTENT_MEDIA_TYPE = {
  MOVIE: 1,
  SERIES: 2,
  EPISODE: 3,
  BOOK: 4,
  ARTICLE: 5,
  DOCUMENTARY: 6,
} as const;

export const CONTENT_MEDIA_TYPE_LABELS = {
  [CONTENT_MEDIA_TYPE.MOVIE]: 'Movie',
  [CONTENT_MEDIA_TYPE.SERIES]: 'Series',
  [CONTENT_MEDIA_TYPE.EPISODE]: 'Episode',
  [CONTENT_MEDIA_TYPE.BOOK]: 'Book',
  [CONTENT_MEDIA_TYPE.ARTICLE]: 'Article',
  [CONTENT_MEDIA_TYPE.DOCUMENTARY]: 'Documentary',
} as const;

// Video Quality
export const VIDEO_QUALITY = {
  AUTO: 'auto',
  '360P': '360p',
  '480P': '480p',
  '720P': '720p',
  '1080P': '1080p',
  '1440P': '1440p',
  '4K': '4k',
} as const;
