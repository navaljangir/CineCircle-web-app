import { AUTH_COOKIE, METHOD, PLATFORM, HTTP_CODE } from "~/lib/constants";
import { ApiError } from "~/lib/errors";
import type { CustomObject, EMethod, ApiResponse } from "~/types/api";

// Global type declaration for client-side window object
declare global {
  interface Window {
    App?: {
      apiUrl: string;
      HOST_URL: string;
      SOCKET_URL: string;
      AMPLITUDE_TRACKING_ID: string;
      AMPLITUDE_SAMPLING_RATE: number;
      APP_ENV: string;
      SENTRY_DSN: string;
    };
  }
}

interface ApiOptions {
  url: string;
  method?: EMethod;
  useAuth?: boolean;
  query?: Record<string, string | number | boolean | undefined>;
  body?: CustomObject;
  formData?: boolean;
  fetchRequest?: Request; // For server-side requests
  auth?: { token: string }; // Alternative auth method
}

const DEFAULT_QUERY_PARAMS = { os: PLATFORM.WEB, cv: 1 };

/**
 * Determines if we're running on the server or client
 */
function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * Gets the base URL for API requests
 */
function getBaseUrl(): string {
  if (isServer()) {
    // Server-side: use environment variable
    return process.env.PROXY_SERVER_URL || '';
  } else {
    // Client-side: use window origin or development URL
    return import.meta.env.VITE_ENV === "dev"
      ? "http://localhost:5173"
      : window.origin;
  }
}

/**
 * Builds query string from parameters
 */
function buildQueryString(query?: Record<string, string | number | boolean | undefined>): string {
  if (!query) return '';
  
  const params = new URLSearchParams();
  const allParams = { ...DEFAULT_QUERY_PARAMS, ...query };
  
  for (const [key, value] of Object.entries(allParams)) {
    if (value !== undefined && value !== null) {
      params.append(key, value.toString());
    }
  }
  
  return params.toString();
}

/**
 * Extracts auth token from request or alternative sources
 */
function getAuthToken(options: ApiOptions): string {
  if (options.auth?.token) {
    return options.auth.token;
  }
  
  if (options.fetchRequest) {
    // Server-side: extract from request headers
    const cookie = options.fetchRequest.headers.get("cookie");
    const authCookie = cookie
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${AUTH_COOKIE}=`));
    
    if (authCookie) {
      return authCookie.split("=")[1];
    }
  }
  
  // Client-side: could implement additional token retrieval logic here
  // For example, from localStorage, sessionStorage, etc.
  
  return '';
}

/**
 * Unified API fetch function that works on both server and client
 */
async function apiFetch<T = any>(options: ApiOptions): Promise<ApiResponse<T>> {
  const baseUrl = getBaseUrl();
  
  if (!baseUrl) {
    throw new ApiError(0, 'Configuration Error', { message: 'Base URL is not configured' });
  }
  
  // Build URL with query parameters
  const queryString = buildQueryString(options.query);
  const url = `${baseUrl}${options.url}${queryString ? `?${queryString}` : ''}`;
  
  // Prepare headers
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  // Add server-side specific headers
  if (isServer()) {
    headers["x-remix-server"] = "true";
  }
  
  // Handle authentication
  if (options.useAuth) {
    const token = getAuthToken(options);
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  
  // Prepare request options
  const fetchOptions: RequestInit = {
    method: options.method || METHOD.GET,
    headers,
    credentials: "include",
    mode: "cors",
  };
  
  // Handle request body
  if (options.body && (options.method !== METHOD.GET)) {
    if (options.formData) {
      // For FormData, don't set Content-Type (browser will set it with boundary)
      delete headers["Content-Type"];
      fetchOptions.body = options.body as FormData;
    } else {
      fetchOptions.body = JSON.stringify(options.body);
    }
  }
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Parse response
    let responseData: any;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }
    
    // Handle non-ok responses
    if (!response.ok) {
      throw new ApiError(
        response.status,
        response.statusText,
        responseData,
        url
      );
    }
    
    return {
      status: response.status,
      data: responseData as T,
    };
  } catch (error) {
    // Re-throw ApiErrors as-is
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Wrap other errors
    throw new ApiError(
      0,
      'Network Error',
      { message: error instanceof Error ? error.message : 'Unknown error occurred' },
      url
    );
  }
}

// HTTP method helpers
export async function get<T = any>(options: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
  return apiFetch<T>({ ...options, method: METHOD.GET });
}

export async function post<T = any>(options: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
  return apiFetch<T>({ ...options, method: METHOD.POST });
}

export async function put<T = any>(options: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
  return apiFetch<T>({ ...options, method: METHOD.PUT });
}

export async function patch<T = any>(options: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
  return apiFetch<T>({ ...options, method: METHOD.PATCH });
}

export async function deleteRequest<T = any>(options: Omit<ApiOptions, 'method'>): Promise<ApiResponse<T>> {
  return apiFetch<T>({ ...options, method: METHOD.DELETE });
}

// Generic API call function (backward compatibility)
export async function callApi<T = any>(endpoint: string, params: {
  request?: Request;
  useAuth?: boolean;
  method?: EMethod;
  query?: Record<string, any>;
  body?: CustomObject;
  formdata?: boolean;
  auth?: { token: string };
}): Promise<T> {
  const options: ApiOptions = {
    url: endpoint,
    method: params.method || METHOD.POST,
    useAuth: params.useAuth,
    query: params.query,
    body: params.body,
    formData: params.formdata,
    fetchRequest: params.request,
    auth: params.auth,
  };
  
  const response = await apiFetch<T>(options);
  return response.data;
}

export default {
  get,
  post,
  put,
  patch,
  delete: deleteRequest,
  callApi,
};
