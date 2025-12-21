// API Endpoints for CineCircle Frontend
export const ENDPOINTS = {
  // Authentication
  LOGIN: "/api/v1/auth/login",
  REGISTER: "/api/v1/auth/register",
LOGOUT: "/api/v1/auth/logout",
  LOGOUT_ALL: "/api/v1/auth/logout-all",
  REFRESH_TOKEN: "/api/v1/auth/refresh",
  OAUTH_LOGIN: "/api/v1/auth/oauth",
  OTP_LOGIN: "/api/v1/auth/otp",

  // User Management
  GET_USER_PROFILE: "/api/v1/users/profile",
  GET_USER_INIT: "/api/v1/users/init",
  UPDATE_USER_PROFILE: "/api/v1/users/profile",
  CHANGE_PASSWORD: "/api/v1/users/password",
  DEACTIVATE_ACCOUNT: "/api/v1/users/account",

  GET_USER_SESSIONS: "/api/v1/users/sessions",
  REVOKE_SESSION: "/api/v1/users/sessions",

  // Admin User Management
  GET_ALL_USERS: "/api/v1/users",
  GET_USER_BY_ID: "/api/v1/users",
  CREATE_USER: "/api/v1/users",
  UPDATE_USER: "/api/v1/users",
  DELETE_USER: "/api/v1/users",
  UPDATE_USER_ROLE: "/api/v1/users",

  // Series
  GET_FEATURED_SERIES: "/api/v1/series/featured",
  GET_SERIES_BY_TITLE_OR_ID: "/api/v1/series",
  GET_ALL_SERIES: "/api/v1/series",

  // Movies
  GET_MOVIES: "/api/v1/movies",
  GET_FEATURED_MOVIES: "/api/v1/movies/featured",
  SEARCH_MOVIES: "/api/v1/movies/search",
  GET_MOVIES_BY_DIRECTOR: "/api/v1/movies/director",
  GET_MOVIE_BY_TITLE_OR_ID: "/api/v1/movies",
  GET_MOVIE_STREAM: "/api/v1/movies", // /:titleOrId/stream
  GET_MOVIE_CAST: "/api/v1/movies", // /:titleOrId/cast
  GET_MOVIE_RELATED: "/api/v1/movies", // /:titleOrId/related
  ADD_MOVIE_TO_WATCHLIST: "/api/v1/movies", // /:titleOrId/watchlist
  REMOVE_MOVIE_FROM_WATCHLIST: "/api/v1/movies", // /:titleOrId/watchlist
  UPDATE_MOVIE_PROGRESS: "/api/v1/movies", // /:titleOrId/progress
  CREATE_COMPLETE_MOVIE: "/api/v1/movies/create-complete",
  UPDATE_MOVIE: "/api/v1/movies", // /:id
  DELETE_MOVIE: "/api/v1/movies", // /:id

  // Videos
  UPLOAD_VIDEO: "/api/v1/videos/upload", // Deprecated
  GET_VIDEO_STATUS: "/api/v1/videos/status", // /:videoId
  GENERATE_VIDEO_ACCESS: "/api/v1/videos/generate-access", // /:videoId
  GET_VIDEO_STREAM: "/api/v1/videos/stream", // /:videoId (deprecated)
  
  // Admin Video Management
  GET_ALL_VIDEOS_ADMIN: "/api/v1/videos/admin/list",
  UPDATE_VIDEO_METADATA: "/api/v1/videos/admin", // /:videoId/metadata
  DELETE_VIDEO: "/api/v1/videos/admin", // /:videoId
  GET_VIDEO_STATS: "/api/v1/videos/admin/stats",
  MODERATE_VIDEO: "/api/v1/videos/admin", // /:videoId/moderate

  // Media (Images)
  UPLOAD_POSTER: "/api/v1/media/upload-poster",
  UPLOAD_BANNER: "/api/v1/media/upload-banner",
  UPLOAD_THUMBNAIL: "/api/v1/media/upload-thumbnail",
  UPLOAD_RESPONSIVE: "/api/v1/media/upload-responsive",
  PROCESS_BATCH_IMAGES: "/api/v1/media/process-batch",
  GET_IMAGE_JOB_STATUS: "/api/v1/media/job-status", // /:jobId

  // Content
  GET_CONTENT_BY_ID: "/api/v1/content",
  SEARCH_CONTENT: "/api/v1/content/search",
  ADD_TO_WATCHLIST: "/api/v1/content/watchlist",
  REMOVE_FROM_WATCHLIST: "/api/v1/content/watchlist",
  UPDATE_WATCH_PROGRESS: "/api/v1/content/progress",

  // Home/Dashboard
  GET_HOME_DATA: "/api/v1/home",
  GET_MOVIES_BY_GENRE: "/api/v1/home/genre",
  QUICK_SEARCH: "/api/v1/home/search",
  GET_TRENDING: "/api/v1/home/trending",
  GET_PLATFORM_STATS: "/api/v1/home/stats",
  GET_MOVIE_COLLECTIONS: "/api/v1/home/collections",
  GET_USER_DASHBOARD: "/api/v1/home/dashboard",
  GET_PERSONALIZED_CONTENT: "/api/v1/home/personalized",

  // Health Check
  HEALTH_CHECK: "/api/v1/health",
} as const;
