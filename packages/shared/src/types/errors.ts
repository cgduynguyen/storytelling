/**
 * Base error class for all application errors
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

/**
 * Authentication error (401)
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

/**
 * Authorization error (403)
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED');
  }
}

/**
 * Content safety error (422)
 */
export class ContentSafetyError extends AppError {
  constructor(message: string = 'Content does not meet safety requirements') {
    super(message, 422, 'CONTENT_SAFETY_VIOLATION');
  }
}

/**
 * Story generation error (500)
 */
export class StoryGenerationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'STORY_GENERATION_ERROR', details);
  }
}

/**
 * Audio generation error (500)
 */
export class AudioGenerationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'AUDIO_GENERATION_ERROR', details);
  }
}

/**
 * Storage limit error (422)
 */
export class StorageLimitError extends AppError {
  constructor(message: string = 'Storage limit exceeded') {
    super(message, 422, 'STORAGE_LIMIT_EXCEEDED');
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, details?: unknown) {
    super(
      `External service error: ${service}`,
      502,
      'EXTERNAL_SERVICE_ERROR',
      details
    );
  }
}

/**
 * Error type for serialization/transport
 */
export interface SerializedError {
  name: string;
  message: string;
  statusCode: number;
  code: string;
  details?: unknown;
  stack?: string;
}

/**
 * Serialize error for transport
 */
export function serializeError(error: Error): SerializedError {
  if (error instanceof AppError) {
    return {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    };
  }

  return {
    name: error.name,
    message: error.message,
    statusCode: 500,
    code: 'INTERNAL_ERROR',
    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
  };
}
