import { SerializedError } from './errors';

/**
 * Standard success response wrapper
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard error response wrapper
 */
export interface ApiErrorResponse {
  success: false;
  error: SerializedError;
}

/**
 * Union type for all API responses
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

/**
 * Paginated response metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T = unknown> {
  success: true;
  data: T[];
  meta: PaginationMeta;
}

/**
 * Job status response (for async operations)
 */
export interface JobStatusResponse {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  result?: unknown;
  error?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    ai: 'up' | 'down';
  };
}

/**
 * Helper to create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string
): ApiSuccessResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Helper to create error response
 */
export function createErrorResponse(error: SerializedError): ApiErrorResponse {
  return {
    success: false,
    error,
  };
}

/**
 * Helper to create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  return {
    success: true,
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}
