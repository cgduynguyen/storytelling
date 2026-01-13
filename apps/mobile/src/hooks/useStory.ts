import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import type {
  StoryResponse,
  CreateStoryRequest,
  StoryTheme,
  StoryLength,
} from '@storyteller/shared';

/**
 * Story hooks using TanStack Query
 *
 * Provides hooks for creating, fetching, and managing stories
 */

// Query keys
const storyKeys = {
  all: ['stories'] as const,
  lists: () => [...storyKeys.all, 'list'] as const,
  list: (filters: string) => [...storyKeys.lists(), filters] as const,
  details: () => [...storyKeys.all, 'detail'] as const,
  detail: (id: string) => [...storyKeys.details(), id] as const,
};

/**
 * Hook to create a new story
 */
export const useCreateStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateStoryRequest) => {
      const response = await apiClient.post<StoryResponse>('/stories', data);
      return response.data;
    },
    onSuccess: (newStory) => {
      // Invalidate story list queries
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
      // Optimistically add the new story to cache
      queryClient.setQueryData(storyKeys.detail(newStory.id), newStory);
    },
  });
};

/**
 * Hook to fetch a single story by ID
 */
export const useStory = (storyId: string | undefined) => {
  return useQuery({
    queryKey: storyKeys.detail(storyId || ''),
    queryFn: async () => {
      if (!storyId) {
        throw new Error('Story ID is required');
      }
      const response = await apiClient.get<StoryResponse>(
        `/stories/${storyId}`
      );
      return response.data;
    },
    enabled: !!storyId,
    // Refetch on mount if data is stale
    staleTime: 5 * 60 * 1000, // 5 minutes
    // Keep story data in cache longer
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
};

/**
 * Hook to fetch story history (all user's stories)
 */
export const useStoryHistory = () => {
  return useQuery({
    queryKey: storyKeys.lists(),
    queryFn: async () => {
      const response = await apiClient.get<StoryResponse[]>('/stories');
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook to delete a story
 */
export const useDeleteStory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (storyId: string) => {
      await apiClient.delete(`/stories/${storyId}`);
      return storyId;
    },
    onSuccess: (deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: storyKeys.detail(deletedId) });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: storyKeys.lists() });
    },
  });
};

/**
 * Types for theme and length selectors
 */
export interface ThemeOption {
  value: StoryTheme;
  label: string;
  emoji: string;
}

export interface LengthOption {
  value: StoryLength;
  label: string;
  description: string;
  estimatedWords: number;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { value: 'ADVENTURE', label: 'Adventure', emoji: '🗺️' },
  { value: 'FANTASY', label: 'Fantasy', emoji: '🧙‍♂️' },
  { value: 'SPACE', label: 'Space', emoji: '🚀' },
  { value: 'UNDERWATER', label: 'Ocean', emoji: '🌊' },
  { value: 'NATURE', label: 'Nature', emoji: '🌳' },
  { value: 'ANIMALS', label: 'Animals', emoji: '🐾' },
  { value: 'FRIENDSHIP', label: 'Friendship', emoji: '🤝' },
  { value: 'RANDOM', label: 'Surprise Me', emoji: '🎲' },
];

export const LENGTH_OPTIONS: LengthOption[] = [
  {
    value: 'SHORT',
    label: 'Short',
    description: '2-3 minutes',
    estimatedWords: 150,
  },
  {
    value: 'MEDIUM',
    label: 'Medium',
    description: '5-7 minutes',
    estimatedWords: 500,
  },
  {
    value: 'LONG',
    label: 'Long',
    description: '10-15 minutes',
    estimatedWords: 1000,
  },
];
