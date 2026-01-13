import { create } from 'zustand';
import type {
  StoryResponse,
  StoryTheme,
  StoryLength,
} from '@storyteller/shared';

/**
 * Story store using Zustand
 *
 * Manages current story state and creation flow
 */

interface StoryCreationParams {
  theme?: StoryTheme;
  length?: StoryLength;
  mainCharacter?: string;
  isInteractive?: boolean;
}

interface StoryState {
  // Current story being viewed
  currentStory: StoryResponse | null;

  // Story creation flow
  creationParams: StoryCreationParams;

  // Loading states
  isGenerating: boolean;
  generationProgress: number; // 0-100

  // Actions
  setCurrentStory: (story: StoryResponse | null) => void;
  updateCreationParams: (params: Partial<StoryCreationParams>) => void;
  resetCreationParams: () => void;
  setGenerating: (isGenerating: boolean) => void;
  setGenerationProgress: (progress: number) => void;
}

const initialCreationParams: StoryCreationParams = {
  theme: undefined,
  length: 'MEDIUM',
  mainCharacter: '',
  isInteractive: false,
};

export const useStoryStore = create<StoryState>((set) => ({
  // Initial state
  currentStory: null,
  creationParams: initialCreationParams,
  isGenerating: false,
  generationProgress: 0,

  // Set current story
  setCurrentStory: (story) => {
    set({ currentStory: story });
  },

  // Update creation parameters
  updateCreationParams: (params) => {
    set((state) => ({
      creationParams: {
        ...state.creationParams,
        ...params,
      },
    }));
  },

  // Reset creation parameters to defaults
  resetCreationParams: () => {
    set({
      creationParams: initialCreationParams,
      isGenerating: false,
      generationProgress: 0,
    });
  },

  // Set generating state
  setGenerating: (isGenerating) => {
    set({
      isGenerating,
      generationProgress: isGenerating ? 0 : 100,
    });
  },

  // Update generation progress
  setGenerationProgress: (progress) => {
    set({ generationProgress: Math.min(100, Math.max(0, progress)) });
  },
}));
