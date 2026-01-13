import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { AppError, HttpStatus } from '../middleware/errorHandler';
import { storyGenerationService } from '../services/storyGeneration';
import { addStoryGenerationJob } from '../lib/queue';
import { CreateStoryRequestSchema } from '@storyteller/shared';
import { logger } from '../lib/logger';

const router: Router = Router();

/**
 * POST /api/v1/stories
 * Create a new story (queues generation)
 */
router.post(
  '/',
  authenticate,
  validate(CreateStoryRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { theme, length, ageBand, isInteractive, mainCharacter } = req.body;

      // Create story record
      const result = await storyGenerationService.createStory({
        userId,
        theme,
        length,
        ageBand,
        isInteractive: isInteractive || false,
        mainCharacter,
        excludedThemes: [], // TODO: Fetch from user settings
      });

      // Queue story generation job
      await addStoryGenerationJob({
        storyId: result.storyId,
        userId,
        theme,
        length,
        ageBand,
        characterName: mainCharacter,
        isInteractive: isInteractive || false,
      });

      // Get the story details
      const story = await storyGenerationService.getStory(
        result.storyId,
        userId
      );

      logger.info({ storyId: result.storyId, userId }, 'Story creation queued');

      res.status(202).json(story);
    } catch (error) {
      logger.error({ error }, 'Failed to create story');
      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to create story'
      );
    }
  }
);

/**
 * GET /api/v1/stories/:id
 * Get story details
 */
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const storyId = req.params.id;

    const story = await storyGenerationService.getStory(storyId, userId);

    res.json(story);
  } catch (error) {
    logger.error({ error, storyId: req.params.id }, 'Failed to get story');

    if (error instanceof Error && error.message === 'Story not found') {
      throw new AppError(HttpStatus.NOT_FOUND, 'Story not found');
    }

    throw new AppError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve story'
    );
  }
});

/**
 * GET /api/v1/stories
 * Get story history
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;

    const result = await storyGenerationService.getStoryHistory(userId, {
      limit: Math.min(limit, 100), // Cap at 100
      offset,
      status,
    });

    res.json(result);
  } catch (error) {
    logger.error({ error }, 'Failed to get story history');
    throw new AppError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to retrieve stories'
    );
  }
});

/**
 * DELETE /api/v1/stories/:id
 * Delete a story
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const storyId = req.params.id;

    await storyGenerationService.deleteStory(storyId, userId);

    res.status(204).send();
  } catch (error) {
    logger.error({ error, storyId: req.params.id }, 'Failed to delete story');

    if (error instanceof Error && error.message === 'Story not found') {
      throw new AppError(HttpStatus.NOT_FOUND, 'Story not found');
    }

    throw new AppError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to delete story'
    );
  }
});

/**
 * GET /api/v1/stories/:id/audio
 * Stream story audio (placeholder - will be implemented in US2)
 */
router.get('/:id/audio', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;
    const storyId = req.params.id;

    // Verify story exists and belongs to user
    const story = await storyGenerationService.getStory(storyId, userId);

    if (!story.audioData) {
      throw new AppError(HttpStatus.NOT_FOUND, 'Audio not available');
    }

    // Set audio headers
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': story.audioData.length.toString(),
      'Accept-Ranges': 'bytes',
    });

    // Stream audio
    res.send(story.audioData);
  } catch (error) {
    logger.error({ error, storyId: req.params.id }, 'Failed to stream audio');

    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Failed to stream audio'
    );
  }
});

/**
 * GET /api/v1/stories/:id/segments
 * Get interactive story segments (placeholder - will be fully implemented in US5)
 */
router.get(
  '/:id/segments',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const storyId = req.params.id;

      const story = await storyGenerationService.getStory(storyId, userId);

      if (!story.isInteractive) {
        throw new AppError(HttpStatus.BAD_REQUEST, 'Story is not interactive');
      }

      res.json({
        segments: story.segments || [],
      });
    } catch (error) {
      logger.error({ error, storyId: req.params.id }, 'Failed to get segments');

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to retrieve segments'
      );
    }
  }
);

/**
 * GET /api/v1/stories/:id/segments/:segmentId/audio
 * Stream segment audio (placeholder - will be implemented in US5)
 */
router.get(
  '/:id/segments/:segmentId/audio',
  authenticate,
  async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const storyId = req.params.id;
      const segmentId = req.params.segmentId;

      // Verify story exists and belongs to user
      const story = await storyGenerationService.getStory(storyId, userId);

      if (!story.isInteractive) {
        throw new AppError(HttpStatus.BAD_REQUEST, 'Story is not interactive');
      }

      const segment = story.segments?.find(
        (s: { id: string }) => s.id === segmentId
      );
      if (!segment) {
        throw new AppError(HttpStatus.NOT_FOUND, 'Segment not found');
      }

      if (!segment.audioData) {
        throw new AppError(HttpStatus.NOT_FOUND, 'Audio not available');
      }

      // Set audio headers
      res.set({
        'Content-Type': 'audio/mpeg',
        'Content-Length': segment.audioData.length.toString(),
        'Accept-Ranges': 'bytes',
      });

      // Stream audio
      res.send(segment.audioData);
    } catch (error) {
      logger.error(
        { error, storyId: req.params.id, segmentId: req.params.segmentId },
        'Failed to stream segment audio'
      );

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Failed to stream audio'
      );
    }
  }
);

export default router;
