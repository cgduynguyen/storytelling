import { QueryClient } from '@tanstack/react-query';

/**
 * TanStack Query client configuration for AI Storyteller
 *
 * Configured for:
 * - Offline-first: Retry failed queries automatically
 * - Fresh data: 30s stale time for most queries
 * - Error handling: Failed queries remain cached for debugging
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: Data is considered fresh for 30 seconds
      staleTime: 30 * 1000,

      // Cache time: Keep unused data in cache for 5 minutes
      gcTime: 5 * 60 * 1000,

      // Retry failed requests up to 3 times with exponential backoff
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus for fresh data
      refetchOnWindowFocus: true,

      // Don't refetch on mount if data is still fresh
      refetchOnMount: false,

      // Refetch on network reconnection
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations only once for user actions
      retry: 1,
      retryDelay: 1000,
    },
  },
});
