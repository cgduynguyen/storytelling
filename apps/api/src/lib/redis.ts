import Redis from 'ioredis';
import { config } from '../config/env';
import { logger } from './logger';

/**
 * Redis client singleton for caching and BullMQ
 */
export const redis = new Redis({
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis connection error');
});

redis.on('close', () => {
  logger.warn('Redis connection closed');
});

/**
 * Create a new Redis connection for BullMQ workers
 * BullMQ requires separate connections for queue and worker
 */
export const createRedisConnection = () => {
  return new Redis({
    host: config.REDIS_HOST,
    port: config.REDIS_PORT,
    maxRetriesPerRequest: null,
  });
};
