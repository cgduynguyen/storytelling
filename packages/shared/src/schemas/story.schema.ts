import { z } from 'zod';
import {
  AgeBandSchema,
  StoryThemeSchema,
  StoryLengthSchema,
  StoryStatusSchema,
} from './enums';

/**
 * Word boundary data for synchronized text highlighting during narration
 */
export const WordBoundarySchema = z.object({
  text: z.string(),
  offset: z.number().int().min(0),
  duration: z.number().int().min(0),
  audioOffset: z.number().int().min(0),
});
export type WordBoundary = z.infer<typeof WordBoundarySchema>;

/**
 * Request schema for creating a new story
 */
export const CreateStoryRequestSchema = z.object({
  theme: StoryThemeSchema,
  length: StoryLengthSchema,
  mainCharacter: z
    .string()
    .min(1)
    .max(30)
    .regex(
      /^[a-zA-Z\s]+$/,
      'Main character name must contain only letters and spaces'
    )
    .optional(),
  isInteractive: z.boolean().default(false),
});
export type CreateStoryRequest = z.infer<typeof CreateStoryRequestSchema>;

/**
 * Story response schema
 */
export const StoryResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  theme: StoryThemeSchema,
  length: StoryLengthSchema,
  ageBand: AgeBandSchema,
  isInteractive: z.boolean(),
  mainCharacter: z.string().nullable(),
  status: StoryStatusSchema,
  content: z.string().nullable(),
  audioUrl: z.string().url().nullable(),
  wordBoundaries: z.array(WordBoundarySchema).nullable(),
  savedToLibrary: z.boolean(),
  error: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type StoryResponse = z.infer<typeof StoryResponseSchema>;

/**
 * Story list item schema (lightweight version for library views)
 */
export const StoryListItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  theme: StoryThemeSchema,
  length: StoryLengthSchema,
  ageBand: AgeBandSchema,
  isInteractive: z.boolean(),
  status: StoryStatusSchema,
  savedToLibrary: z.boolean(),
  createdAt: z.string().datetime(),
});
export type StoryListItem = z.infer<typeof StoryListItemSchema>;

/**
 * Story segment schema (for interactive stories)
 */
export const StorySegmentSchema = z
  .object({
    id: z.string().uuid(),
    storyId: z.string().uuid(),
    content: z.string().min(50).max(2000),
    audioUrl: z.string().url().nullable(),
    wordBoundaries: z.array(WordBoundarySchema).nullable(),
    order: z.number().int().min(0),
    isEnding: z.boolean(),
    choices: z
      .array(
        z.object({
          id: z.string().uuid(),
          text: z.string().min(10).max(100),
          nextSegmentId: z.string().uuid(),
          order: z.number().int().min(1).max(3),
        })
      )
      .max(3),
  })
  .refine(
    (data) => {
      // Non-ending segments must have at least 1 choice
      if (!data.isEnding && data.choices.length === 0) {
        return false;
      }
      // Ending segments should have no choices
      if (data.isEnding && data.choices.length > 0) {
        return false;
      }
      return true;
    },
    {
      message:
        'Non-ending segments must have 1-3 choices; ending segments must have no choices',
    }
  );
export type StorySegment = z.infer<typeof StorySegmentSchema>;

/**
 * Choice schema for interactive stories
 */
export const ChoiceSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(10).max(100),
  nextSegmentId: z.string().uuid(),
  order: z.number().int().min(1).max(3),
});
export type Choice = z.infer<typeof ChoiceSchema>;
