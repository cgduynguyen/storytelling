import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import {
  getSecure,
  saveSecure,
  clearSecureStorage,
} from '../lib/secureStorage';

/**
 * API client for AI Storyteller backend
 *
 * Features:
 * - Automatic JWT token injection
 * - Token refresh on 401 errors
 * - Request/response interceptors for logging
 * - Type-safe error handling
 */

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * Create axios instance with default config
 */
const createApiClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor: Add JWT token to all requests
  client.interceptors.request.use(
    async (config) => {
      const token = await getSecure('ACCESS_TOKEN');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor: Handle token refresh on 401
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      // If 401 and not already retried, attempt token refresh
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const refreshToken = await getSecure('REFRESH_TOKEN');
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          // Attempt to refresh token
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data;

          // Save new tokens
          await saveSecure('ACCESS_TOKEN', accessToken);
          await saveSecure('REFRESH_TOKEN', newRefreshToken);

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          return client(originalRequest);
        } catch (refreshError) {
          // Refresh failed - clear storage and redirect to login
          await clearSecureStorage();
          throw refreshError;
        }
      }

      return Promise.reject(error);
    }
  );

  return client;
};

export const apiClient = createApiClient();

/**
 * Type-safe API error handler
 */
export interface ApiError {
  message: string;
  code?: string;
  statusCode?: number;
  details?: unknown;
}

export function handleApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{
      message?: string;
      error?: string;
    }>;

    return {
      message:
        axiosError.response?.data?.message ||
        axiosError.response?.data?.error ||
        axiosError.message ||
        'An unexpected error occurred',
      code: axiosError.code,
      statusCode: axiosError.response?.status,
      details: axiosError.response?.data,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unexpected error occurred',
  };
}

/**
 * Helper function to check if device is online
 */
export async function checkConnection(): Promise<boolean> {
  try {
    await apiClient.get('/health', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
