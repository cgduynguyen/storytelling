import { Worker, Job } from 'bullmq';
import { createRedisConnection } from '../lib/redis';
import { logger } from '../lib/logger';
import { storyGenerationService } from '../services/storyGeneration';
import type { StoryJobData } from '../lib/queue';

/**
 * Process story generation job
 */
async function processStoryJob(job: Job<StoryJobData>): Promise<void> {
  const { storyId } = job.data;

  logger.info({ jobId: job.id, storyId }, 'Processing story generation job');

  try {
    // Update progress
    await job.updateProgress(10);

    // Generate story content using AI
    await storyGenerationService.generateStoryContent(storyId);

    await job.updateProgress(100);

    logger.info({ jobId: job.id, storyId }, 'Story generation completed');
  } catch (error) {
    logger.error({ error, jobId: job.id, storyId }, 'Story generation failed');
    throw error;
  }
}

/**
 * Story generation worker
 */
export const storyWorker = new Worker<StoryJobData>(
  'story-generation',
  processStoryJob,
  {
    connection: createRedisConnection(),
    concurrency: 5, // Process up to 5 stories concurrently
    limiter: {
      max: 10, // Max 10 jobs
      duration: 60000, // Per minute
    },
  }
);

// Worker event handlers
storyWorker.on('completed', (job) => {
  logger.info(
    { jobId: job.id, storyId: job.data.storyId },
    'Story worker completed job'
  );
});

storyWorker.on('failed', (job, error) => {
  logger.error(
    {
      jobId: job?.id,
      storyId: job?.data?.storyId,
      error: error.message,
      stack: error.stack,
    },
    'Story worker failed job'
  );
});

storyWorker.on('error', (error) => {
  logger.error({ error }, 'Story worker error');
});

storyWorker.on('active', (job) => {
  logger.info(
    { jobId: job.id, storyId: job.data.storyId },
    'Story worker processing job'
  );
});

// Graceful shutdown
const shutdown = async () => {
  logger.info('Shutting down story worker...');
  await storyWorker.close();
  logger.info('Story worker closed');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

logger.info('Story generation worker started');

export default storyWorker;
