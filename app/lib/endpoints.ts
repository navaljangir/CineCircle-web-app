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

  // Content
  GET_CONTENT_BY_ID: "/api/v1/content",
  SEARCH_CONTENT: "/api/v1/content/search",
  ADD_TO_WATCHLIST: "/api/v1/content/watchlist",
  REMOVE_FROM_WATCHLIST: "/api/v1/content/watchlist",
  UPDATE_WATCH_PROGRESS: "/api/v1/content/progress",

  // Admin Content Management
  GET_ALL_VIDEOS: "/api/v1/content/admin/videos",
  UPDATE_VIDEO_METADATA: "/api/v1/content/admin/videos",
  DELETE_VIDEO: "/api/v1/content/admin/videos",
  MODERATE_VIDEO: "/api/v1/content/admin/moderate",
  GET_UPLOAD_STATS: "/api/v1/content/admin/upload-stats",

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
