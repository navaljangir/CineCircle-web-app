import type { ApiError as ApiErrorType } from "~/types/api";

export class ApiError extends Error implements ApiErrorType {
  public status: number;
  public statusText: string;
  public data?: any;
  public url?: string;

  constructor(status: number, statusText: string, data?: any, url?: string) {
    const message = data?.message || statusText || `HTTP ${status}`;
    super(message);
    
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
    this.url = url;
    this.message = message;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  public toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      statusText: this.statusText,
      data: this.data,
      url: this.url,
    };
  }
}
