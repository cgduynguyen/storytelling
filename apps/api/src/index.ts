import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { config } from './config/env';
import { logger } from './lib/logger';
import prisma from './lib/prisma';
import { redis } from './lib/redis';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

/**
 * Create and configure Express application
 */
const createApp = (): Application => {
  const app = express();

  // Trust proxy - required for rate limiting and IP detection behind load balancers
  // Set to 1 to trust the first proxy (common setup)
  // In production, configure based on your infrastructure
  app.set('trust proxy', 1);

  // Security middleware
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS configuration
  app.use(
    cors({
      origin:
        config.NODE_ENV === 'production'
          ? ['https://storyteller.app'] // Update with actual production URL
          : [
              'http://localhost:3000',
              'http://localhost:8081',
              'http://127.0.0.1:3000',
              'http://127.0.0.1:8081',
            ], // Expo dev server and API
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Rate limiting
  const limiter = rateLimit({
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    max: config.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
    // Use X-Forwarded-For header when behind proxy
    keyGenerator: (req) => {
      // Try to get real IP from X-Forwarded-For, fallback to req.ip
      const forwarded = req.headers['x-forwarded-for'];
      if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
      }
      return req.ip || 'unknown';
    },
  });
  app.use('/api/', limiter);

  // Request logging
  app.use(pinoHttp({ logger }));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // API routes
  app.use('/api/v1', routes);

  // Root endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'AI Storyteller API',
      version: '1.0.0',
      status: 'running',
      docs: '/api/v1/health',
    });
  });

  // 404 handler
  app.use(notFoundHandler);

  // Error handling (must be last)
  app.use(errorHandler);

  return app;
};

/**
 * Start the server
 */
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info('Database connected');

    // Test Redis connection
    await redis.ping();
    logger.info('Redis connected');

    // Create Express app
    const app = createApp();

    // Start HTTP server
    const server = app.listen(config.PORT, () => {
      logger.info(
        {
          port: config.PORT,
          env: config.NODE_ENV,
        },
        `🚀 Server running on http://localhost:${config.PORT}`
      );
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      // Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database connection
      await prisma.$disconnect();
      logger.info('Database disconnected');

      // Close Redis connection
      await redis.quit();
      logger.info('Redis disconnected');

      process.exit(0);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    logger.error({ err: error }, 'Failed to start server');
    process.exit(1);
  }
};

// Start server if this file is run directly
if (require.main === module) {
  startServer();
}

export { createApp, startServer };
