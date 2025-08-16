// API types
export type EMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface CustomObject {
  [key: string]: any;
}

export interface ApiResponse<T = any> {
  status: number;
  data: T;
}

export interface ApiError {
  status: number;
  statusText: string;
  data?: any;
  url?: string;
  message: string;
}

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}
