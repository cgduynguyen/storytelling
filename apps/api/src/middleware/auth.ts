import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';
import { AppError, HttpStatus } from './errorHandler';
import prisma from '../lib/prisma';

/**
 * Extend Express Request to include authenticated user
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Extract JWT token from Authorization header
 *
 * @param req - Express request
 * @returns JWT token or null
 */
const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  // Expected format: "Bearer <token>"
  const parts = authHeader.split(' ');

  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Middleware to authenticate requests using JWT
 * Verifies token and attaches user to request object
 *
 * @example
 * router.get('/stories', authenticate, handler);
 */
export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // Extract token from header
    const token = extractToken(req);

    if (!token) {
      throw new AppError(
        HttpStatus.UNAUTHORIZED,
        'Authentication required. Please provide a valid token.'
      );
    }

    // Verify and decode token
    let payload: JwtPayload;
    try {
      payload = verifyToken(token, 'access');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid token';
      throw new AppError(HttpStatus.UNAUTHORIZED, message);
    }

    // Verify user still exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      throw new AppError(HttpStatus.UNAUTHORIZED, 'User no longer exists');
    }

    // Attach user to request
    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require authentication
 *
 * @example
 * router.get('/public-stories', optionalAuth, handler);
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (!token) {
      // No token provided, continue without user
      return next();
    }

    try {
      const payload = verifyToken(token, 'access');

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true },
      });

      if (user) {
        req.user = user;
      }
    } catch {
      // Invalid token, continue without user
      // Don't throw error for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
};
