import type { AgeBand, StoryTheme, StoryLength } from '@storyteller/shared';
import type { Story, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { nvidiaClient } from '../lib/nvidia';
import { logger } from '../lib/logger';
import {
  buildStoryPrompt,
  buildInteractiveStoryPrompt,
  validateStoryContent,
  extractTitle,
} from './prompts';

export interface CreateStoryParams {
  userId: string;
  theme: StoryTheme;
  length: StoryLength;
  ageBand: AgeBand;
  isInteractive: boolean;
  mainCharacter?: string;
  excludedThemes?: string[];
}

export interface GenerateStoryResult {
  storyId: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
}

/**
 * Service for generating AI stories with content safety
 */
export class StoryGenerationService {
  /**
   * Create a new story request and queue it for generation
   */
  async createStory(params: CreateStoryParams): Promise<GenerateStoryResult> {
    const { userId, theme, length, ageBand, isInteractive, mainCharacter } =
      params;

    try {
      // Validate user exists and check library limit
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          _count: {
            select: {
              stories: {
                where: { savedToLibrary: true },
              },
            },
          },
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Create story record with PENDING status
      const story = await prisma.story.create({
        data: {
          userId,
          title: 'Generating story...', // Temporary title
          theme,
          length,
          ageBand,
          isInteractive,
          mainCharacter: mainCharacter?.trim() || null,
          status: 'PENDING',
          savedToLibrary: false,
        },
      });

      logger.info(
        {
          storyId: story.id,
          userId,
          theme,
          length,
          ageBand,
          isInteractive,
        },
        'Story creation queued'
      );

      return {
        storyId: story.id,
        status: 'PENDING',
      };
    } catch (error) {
      logger.error({ error, params }, 'Failed to create story');
      throw error;
    }
  }

  /**
   * Generate story content using AI
   * Called by the worker
   */
  async generateStoryContent(storyId: string): Promise<void> {
    try {
      // Update status to GENERATING
      const story = await prisma.story.update({
        where: { id: storyId },
        data: { status: 'GENERATING' },
      });

      logger.info({ storyId }, 'Starting story generation');

      if (story.isInteractive) {
        await this.generateInteractiveContent(story);
      } else {
        await this.generateLinearContent(story);
      }

      logger.info({ storyId }, 'Story generation completed');
    } catch (error) {
      logger.error({ error, storyId }, 'Story generation failed');

      // Update story status to FAILED
      await prisma.story.update({
        where: { id: storyId },
        data: {
          status: 'FAILED',
        },
      });

      throw error;
    }
  }

  /**
   * Generate linear (non-interactive) story
   */
  private async generateLinearContent(story: Story): Promise<void> {
    // Build prompt
    const prompt = buildStoryPrompt({
      ageBand: story.ageBand as AgeBand,
      theme: story.theme as StoryTheme,
      length: story.length as StoryLength,
      mainCharacter: story.mainCharacter || undefined,
      excludedThemes: [], // TODO: Fetch from user settings
    });

    // Generate content
    const content = await nvidiaClient.generateStory(prompt, {
      temperature: 0.7,
      maxTokens: this.getMaxTokensForLength(story.length),
    });

    // Validate content safety
    const safetyCheck = validateStoryContent(content);
    if (!safetyCheck.isSafe) {
      logger.warn(
        {
          storyId: story.id,
          violations: safetyCheck.violations,
        },
        'Story content failed safety check'
      );

      // Retry generation with stricter prompt
      throw new Error(
        `Story content safety violation: ${safetyCheck.violations.join(', ')}`
      );
    }

    // Extract title and story text
    const { title, storyText } = extractTitle(content);

    // Update story with generated content
    await prisma.story.update({
      where: { id: story.id },
      data: {
        title,
        content: storyText,
        status: 'AUDIO_PENDING', // Audio will be generated next
      },
    });

    logger.info(
      {
        storyId: story.id,
        title,
        contentLength: storyText.length,
      },
      'Linear story content generated'
    );
  }

  /**
   * Generate interactive story with segments
   */
  private async generateInteractiveContent(story: Story): Promise<void> {
    // Build prompt for interactive story
    const prompt = buildInteractiveStoryPrompt({
      ageBand: story.ageBand as AgeBand,
      theme: story.theme as StoryTheme,
      length: story.length as StoryLength,
      mainCharacter: story.mainCharacter || undefined,
      excludedThemes: [], // TODO: Fetch from user settings
    });

    // Generate interactive content
    const result = await nvidiaClient.generateInteractiveStory(prompt, {
      temperature: 0.7,
      maxTokens: this.getMaxTokensForLength(story.length) + 500, // Extra for structure
    });

    // Validate minimum choice points (at least 3)
    const choicePoints = result.segments.filter(
      (seg) => seg.choices && seg.choices.length > 0
    );

    if (choicePoints.length < 3) {
      throw new Error(
        `Interactive story must have at least 3 choice points, got ${choicePoints.length}`
      );
    }

    // Validate all content for safety
    for (const segment of result.segments) {
      const safetyCheck = validateStoryContent(segment.content);
      if (!safetyCheck.isSafe) {
        logger.warn(
          {
            storyId: story.id,
            violations: safetyCheck.violations,
          },
          'Segment content failed safety check'
        );
        throw new Error(
          `Segment safety violation: ${safetyCheck.violations.join(', ')}`
        );
      }
    }

    // Create segments in database
    const segmentIdMap = new Map<string, string>(); // AI ID -> DB ID

    for (let i = 0; i < result.segments.length; i++) {
      const segment = result.segments[i];
      const dbSegment = await prisma.storySegment.create({
        data: {
          storyId: story.id,
          content: segment.content,
          order: i,
          isEnding: segment.isEnding || false,
        },
      });

      // Map AI segment ID to database ID using the AI-provided segment.id
      segmentIdMap.set(segment.id, dbSegment.id);
    }

    // Create choices with proper references
    for (let i = 0; i < result.segments.length; i++) {
      const segment = result.segments[i];
      const segmentId = segmentIdMap.get(segment.id);

      if (segment.choices && segmentId) {
        for (let j = 0; j < segment.choices.length; j++) {
          const choice = segment.choices[j];
          const nextSegmentId = choice.nextSegmentId
            ? segmentIdMap.get(choice.nextSegmentId)
            : undefined;

          await prisma.choice.create({
            data: {
              segmentId,
              text: choice.text,
              nextSegmentId,
              order: j,
            },
          });
        }
      }
    }

    // Update story with title and status
    const title = `Interactive ${story.theme} Adventure`;
    await prisma.story.update({
      where: { id: story.id },
      data: {
        title,
        status: 'AUDIO_PENDING', // Segments will need audio generation
      },
    });

    logger.info(
      {
        storyId: story.id,
        segmentCount: result.segments.length,
        choicePoints: choicePoints.length,
      },
      'Interactive story content generated'
    );
  }

  /**
   * Get story by ID
   */
  async getStory(storyId: string, userId: string) {
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        userId,
      },
      include: {
        segments: {
          orderBy: { order: 'asc' },
          include: {
            choices: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    return story;
  }

  /**
   * Get user's story history
   */
  async getStoryHistory(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      status?: string;
    } = {}
  ) {
    const { limit = 20, offset = 0, status } = options;

    const where: Prisma.StoryWhereInput = { userId };
    if (status) {
      where.status = status as Prisma.StoryWhereInput['status'];
    }

    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          title: true,
          theme: true,
          length: true,
          ageBand: true,
          isInteractive: true,
          status: true,
          savedToLibrary: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.story.count({ where }),
    ]);

    return {
      stories,
      total,
      limit,
      offset,
    };
  }

  /**
   * Delete a story
   */
  async deleteStory(storyId: string, userId: string): Promise<void> {
    const story = await prisma.story.findFirst({
      where: { id: storyId, userId },
    });

    if (!story) {
      throw new Error('Story not found');
    }

    // Delete story and cascade to segments/choices
    await prisma.story.delete({
      where: { id: storyId },
    });

    logger.info({ storyId, userId }, 'Story deleted');
  }

  /**
   * Get max tokens based on story length
   */
  private getMaxTokensForLength(length: StoryLength): number {
    switch (length) {
      case 'SHORT':
        return 600; // ~300 words
      case 'MEDIUM':
        return 1200; // ~600 words
      case 'LONG':
        return 2000; // ~1000 words
      default:
        return 1200;
    }
  }
}

/**
 * Singleton instance
 */
export const storyGenerationService = new StoryGenerationService();
