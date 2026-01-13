import { useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useStoryStore } from '../stores/storyStore';
import type { StoryResponse } from '@storyteller/shared';

/**
 * Story polling hook
 *
 * Polls for story generation status until complete or failed
 * Updates generation progress in the store
 */

interface UseStoryPollingOptions {
  storyId: string | undefined;
  enabled?: boolean;
  onComplete?: (story: StoryResponse) => void;
  onError?: (error: Error) => void;
}

export const useStoryPolling = ({
  storyId,
  enabled = true,
  onComplete,
  onError,
}: UseStoryPollingOptions) => {
  const setGenerationProgress = useStoryStore(
    (state) => state.setGenerationProgress
  );
  const setGenerating = useStoryStore((state) => state.setGenerating);
  const setCurrentStory = useStoryStore((state) => state.setCurrentStory);

  const previousStatusRef = useRef<string | null>(null);

  const query = useQuery({
    queryKey: ['story-polling', storyId],
    queryFn: async () => {
      if (!storyId) {
        throw new Error('Story ID is required');
      }
      const response = await apiClient.get<StoryResponse>(
        `/stories/${storyId}`
      );
      return response.data;
    },
    enabled: enabled && !!storyId,
    // Poll every 2 seconds
    refetchInterval: (query) => {
      // Stop polling if story is complete or failed
      const data = query.state?.data;
      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') {
        return false;
      }
      return 2000; // 2 seconds
    },
    // Don't cache polling results
    staleTime: 0,
    gcTime: 0,
  });

  // Update progress based on status
  useEffect(() => {
    if (!query.data) return;

    const story = query.data;
    const currentStatus = story.status;

    // Only process if status changed
    if (currentStatus === previousStatusRef.current) return;
    previousStatusRef.current = currentStatus;

    // Update progress based on status
    switch (currentStatus) {
      case 'PENDING':
        setGenerationProgress(10);
        setGenerating(true);
        break;
      case 'GENERATING':
        setGenerationProgress(50);
        setGenerating(true);
        break;
      case 'COMPLETED':
        setGenerationProgress(100);
        setGenerating(false);
        setCurrentStory(story);
        onComplete?.(story);
        break;
      case 'FAILED':
        setGenerationProgress(0);
        setGenerating(false);
        onError?.(new Error(story.error || 'Story generation failed'));
        break;
    }
  }, [
    query.data,
    setGenerationProgress,
    setGenerating,
    setCurrentStory,
    onComplete,
    onError,
  ]);

  // Handle query errors
  useEffect(() => {
    if (query.error) {
      setGenerating(false);
      setGenerationProgress(0);
      onError?.(query.error as Error);
    }
  }, [query.error, setGenerating, setGenerationProgress, onError]);

  return {
    story: query.data,
    isPolling: query.isFetching && query.data?.status !== 'COMPLETED',
    isComplete: query.data?.status === 'COMPLETED',
    isFailed: query.data?.status === 'FAILED',
    error: query.error,
    refetch: query.refetch,
  };
};
