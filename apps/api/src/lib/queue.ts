import { Queue, QueueEvents, Job } from 'bullmq';
import { createRedisConnection } from './redis';
import { logger } from './logger';

/**
 * Redis connection for BullMQ
 */
const connection = createRedisConnection();

/**
 * Story generation job data
 */
export interface StoryJobData {
  storyId: string;
  userId: string;
  theme: string;
  ageBand: string;
  length: string;
  characterName?: string;
  isInteractive: boolean;
}

/**
 * Story generation queue
 */
export const storyQueue = new Queue<StoryJobData>('story-generation', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 24 * 3600, // Keep completed jobs for 24 hours
      count: 1000,
    },
    removeOnFail: {
      age: 7 * 24 * 3600, // Keep failed jobs for 7 days
      count: 5000,
    },
  },
});

/**
 * Queue events for monitoring
 */
export const storyQueueEvents = new QueueEvents('story-generation', {
  connection: createRedisConnection(),
});

// Log queue events
storyQueueEvents.on('completed', ({ jobId }) => {
  logger.info({ jobId }, 'Story generation job completed');
});

storyQueueEvents.on('failed', ({ jobId, failedReason }) => {
  logger.error({ jobId, failedReason }, 'Story generation job failed');
});

storyQueueEvents.on('progress', ({ jobId, data }) => {
  logger.debug({ jobId, progress: data }, 'Story generation progress');
});

/**
 * Add a story generation job to the queue
 *
 * @param data - Story generation parameters
 * @returns Job instance
 */
export const addStoryGenerationJob = async (
  data: StoryJobData
): Promise<Job<StoryJobData>> => {
  const job = await storyQueue.add('generate-story', data, {
    jobId: data.storyId, // Use story ID as job ID for idempotency
    priority: 1,
  });

  logger.info(
    { jobId: job.id, storyId: data.storyId },
    'Story generation job added to queue'
  );

  return job;
};

/**
 * Get job status by ID
 *
 * @param jobId - Job ID (same as story ID)
 * @returns Job instance or null
 */
export const getJob = async (
  jobId: string
): Promise<Job<StoryJobData> | undefined> => {
  return await storyQueue.getJob(jobId);
};

/**
 * Check if job is complete
 *
 * @param jobId - Job ID
 * @returns True if job is completed
 */
export const isJobComplete = async (jobId: string): Promise<boolean> => {
  const job = await getJob(jobId);
  if (!job) return false;

  const state = await job.getState();
  return state === 'completed';
};

/**
 * Check if job failed
 *
 * @param jobId - Job ID
 * @returns True if job failed
 */
export const isJobFailed = async (jobId: string): Promise<boolean> => {
  const job = await getJob(jobId);
  if (!job) return false;

  const state = await job.getState();
  return state === 'failed';
};

/**
 * Get job progress
 *
 * @param jobId - Job ID
 * @returns Progress data or null
 */
export const getJobProgress = async (jobId: string): Promise<unknown> => {
  const job = await getJob(jobId);
  if (!job) return null;

  return job.progress;
};

/**
 * Gracefully close queue connections
 */
export const closeQueues = async (): Promise<void> => {
  await storyQueue.close();
  await storyQueueEvents.close();
  await connection.quit();
  logger.info('Queue connections closed');
};

// Handle process termination
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queue connections...');
  await closeQueues();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing queue connections...');
  await closeQueues();
  process.exit(0);
});
