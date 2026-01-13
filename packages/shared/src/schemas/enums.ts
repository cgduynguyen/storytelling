import { z } from 'zod';

/**
 * Age band classifications for content targeting
 */
export const AgeBandSchema = z.enum(['AGE_3_5', 'AGE_6_8', 'AGE_9_10']);
export type AgeBand = z.infer<typeof AgeBandSchema>;

/**
 * Available story themes
 */
export const StoryThemeSchema = z.enum([
  'ADVENTURE',
  'ANIMALS',
  'FANTASY',
  'FRIENDSHIP',
  'SPACE',
  'UNDERWATER',
  'NATURE',
  'RANDOM',
]);
export type StoryTheme = z.infer<typeof StoryThemeSchema>;

/**
 * Story length options
 */
export const StoryLengthSchema = z.enum(['SHORT', 'MEDIUM', 'LONG']);
export type StoryLength = z.infer<typeof StoryLengthSchema>;

/**
 * Story generation and processing status
 */
export const StoryStatusSchema = z.enum([
  'PENDING',
  'GENERATING',
  'AUDIO_PENDING',
  'COMPLETED',
  'FAILED',
]);
export type StoryStatus = z.infer<typeof StoryStatusSchema>;
