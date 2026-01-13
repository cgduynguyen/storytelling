import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../lib/logger';

/**
 * Custom application error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * HTTP status codes for common errors
 */
export const HttpStatus = {
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error response format
 */
interface ErrorResponse {
  status: 'error';
  statusCode: number;
  message: string;
  errors?: Array<{ field: string; message: string }>;
  stack?: string;
}

/**
 * Convert Zod validation errors to structured format
 */
const formatZodError = (error: ZodError) => {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
};

/**
 * Global error handling middleware
 * Must be registered last in the middleware chain
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR;
  let message = 'An unexpected error occurred';
  let errors: Array<{ field: string; message: string }> | undefined;

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof ZodError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Validation failed';
    errors = formatZodError(err);
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = HttpStatus.BAD_REQUEST;

    switch (err.code) {
      case 'P2002':
        message = 'A record with this value already exists';
        break;
      case 'P2025':
        statusCode = HttpStatus.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2003':
        message = 'Foreign key constraint failed';
        break;
      default:
        message = 'Database operation failed';
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = HttpStatus.BAD_REQUEST;
    message = 'Invalid data provided';
  }

  // Log error with context
  // Redact sensitive information from logs
  const sanitizedHeaders = { ...req.headers };
  delete sanitizedHeaders.authorization;
  delete sanitizedHeaders.cookie;
  delete sanitizedHeaders['x-api-key'];

  const sanitizedBody = req.body ? { ...req.body } : undefined;
  if (sanitizedBody) {
    delete sanitizedBody.password;
    delete sanitizedBody.token;
    delete sanitizedBody.secret;
  }

  logger.error(
    {
      err,
      req: {
        method: req.method,
        url: req.url,
        headers: sanitizedHeaders,
        body: sanitizedBody,
        ip: req.ip,
        userAgent: req.get('user-agent'),
      },
      statusCode,
    },
    message
  );

  // Prepare error response
  const response: ErrorResponse = {
    status: 'error',
    statusCode,
    message,
    ...(errors && { errors }),
  };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 handler for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  next(
    new AppError(HttpStatus.NOT_FOUND, `Route ${req.originalUrl} not found`)
  );
};
