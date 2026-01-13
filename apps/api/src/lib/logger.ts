import pino from 'pino';
import { config } from '../config/env';

/**
 * Pino logger instance for structured logging
 * Uses pretty-print in development, JSON in production
 */
export const logger = pino({
  level: config.LOG_LEVEL || 'info',
  transport:
    config.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger with additional context
 */
export const createLogger = (context: Record<string, unknown>) => {
  return logger.child(context);
};
