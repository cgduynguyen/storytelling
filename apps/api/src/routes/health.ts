import { Router, Request, Response } from 'express';
import prisma from '../lib/prisma';
import { redis } from '../lib/redis';
import { asyncHandler } from '../middleware/errorHandler';

const router: Router = Router();

/**
 * Health check response
 */
interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  uptime: number;
  services: {
    database: 'up' | 'down';
    redis: 'up' | 'down';
    queue: 'up' | 'down';
  };
  version?: string;
}

/**
 * GET /health
 * Basic health check endpoint
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const response: HealthCheckResponse = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'down',
        redis: 'down',
        queue: 'down',
      },
      version: process.env.npm_package_version,
    };

    // Check database connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      response.services.database = 'up';
    } catch (error) {
      response.services.database = 'down';
      response.status = 'degraded';
    }

    // Check Redis connection
    try {
      await redis.ping();
      response.services.redis = 'up';
      response.services.queue = 'up'; // Queue uses Redis
    } catch (error) {
      response.services.redis = 'down';
      response.services.queue = 'down';
      response.status = 'degraded';
    }

    // Set overall status
    const allUp = Object.values(response.services).every(
      (status) => status === 'up'
    );
    if (!allUp) {
      response.status = 'degraded';
    }

    // Return appropriate status code
    const statusCode = response.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(response);
  })
);

/**
 * GET /health/live
 * Kubernetes liveness probe - just checks if app is running
 */
router.get('/live', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /health/ready
 * Kubernetes readiness probe - checks if app can serve traffic
 */
router.get(
  '/ready',
  asyncHandler(async (_req: Request, res: Response) => {
    try {
      // Check critical services
      await Promise.all([prisma.$queryRaw`SELECT 1`, redis.ping()]);

      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  })
);

export default router;
