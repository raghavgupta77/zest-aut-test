/**
 * API-related types and interfaces
 */

// Generic API response wrapper
export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: ValidationError[];
}

// Validation error interface
export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

// Request configuration interface
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
}

// HTTP method types
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

// API endpoint configuration
export interface APIEndpoint {
  method: HTTPMethod;
  path: string;
  requiresAuth?: boolean;
  timeout?: number;
}

// Request interceptor interface
export interface RequestInterceptor {
  onRequest?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
  onRequestError?: (error: unknown) => unknown | Promise<unknown>;
}

// Response interceptor interface
export interface ResponseInterceptor {
  onResponse?: <T>(response: APIResponse<T>) => APIResponse<T> | Promise<APIResponse<T>>;
  onResponseError?: (error: unknown) => unknown | Promise<unknown>;
}

// Pagination interface for list responses
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Rate limiting information
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: Date;
  retryAfter?: number;
}