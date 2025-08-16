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

  // Movies
  GET_MOVIES: "/api/v1/movies",
  GET_MOVIE_BY_ID: "/api/v1/movies",
  SEARCH_MOVIES: "/api/v1/movies/search",
  RATE_MOVIE: "/api/v1/movies",
  ADD_MOVIE_COMMENT: "/api/v1/movies",
  ADD_TO_WATCHLIST: "/api/v1/movies",
  REMOVE_FROM_WATCHLIST: "/api/v1/movies",
  UPDATE_WATCH_PROGRESS: "/api/v1/movies",
  GET_USER_WATCHLIST: "/api/v1/movies/user/watchlist",
  GET_WATCH_HISTORY: "/api/v1/movies/user/history",

  // Admin Movie Management
  CREATE_MOVIE: "/api/v1/movies",
  UPDATE_MOVIE: "/api/v1/movies",
  DELETE_MOVIE: "/api/v1/movies",

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
