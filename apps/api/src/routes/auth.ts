import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { AppError, HttpStatus } from '../middleware/errorHandler';
import prisma from '../lib/prisma';
import { generateTokenPair, verifyToken } from '../lib/jwt';
import {
  RegisterRequestSchema,
  LoginRequestSchema,
  RefreshTokenRequestSchema,
} from '@storyteller/shared';
import { logger } from '../lib/logger';

const router: Router = Router();

/**
 * POST /api/v1/auth/register
 * Register a new user account
 */
router.post(
  '/register',
  validate(RegisterRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (existingUser) {
        throw new AppError(HttpStatus.CONFLICT, 'Email already registered');
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
        },
      });

      // Create default parental settings
      await prisma.parentalSettings.create({
        data: {
          userId: user.id,
          pin: await bcrypt.hash('0000', 10), // Default PIN
          ageBand: 'AGE_6_8', // Default age band
          excludedThemes: [],
        },
      });

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      logger.info({ userId: user.id, email: user.email }, 'User registered');

      res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        ...tokens,
      });
    } catch (error) {
      logger.error({ error, email: req.body.email }, 'Registration failed');

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Registration failed'
      );
    }
  }
);

/**
 * POST /api/v1/auth/login
 * Login to existing account
 */
router.post(
  '/login',
  validate(LoginRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      // Find user
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid credentials');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

      if (!isPasswordValid) {
        throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid credentials');
      }

      // Generate tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      logger.info({ userId: user.id, email: user.email }, 'User logged in');

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        ...tokens,
      });
    } catch (error) {
      logger.error({ error, email: req.body.email }, 'Login failed');

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, 'Login failed');
    }
  }
);

/**
 * POST /api/v1/auth/refresh
 * Refresh access token using refresh token
 */
router.post(
  '/refresh',
  validate(RefreshTokenRequestSchema),
  async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;

      // Verify refresh token
      const payload = verifyToken(refreshToken, 'refresh');

      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
      });

      if (!user) {
        throw new AppError(HttpStatus.UNAUTHORIZED, 'User not found');
      }

      // Generate new tokens
      const tokens = generateTokenPair({
        userId: user.id,
        email: user.email,
      });

      logger.info({ userId: user.id }, 'Token refreshed');

      res.json(tokens);
    } catch (error) {
      logger.error({ error }, 'Token refresh failed');

      if (error instanceof Error && error.message.includes('expired')) {
        throw new AppError(HttpStatus.UNAUTHORIZED, 'Refresh token expired');
      }

      if (error instanceof Error && error.message.includes('Invalid')) {
        throw new AppError(HttpStatus.UNAUTHORIZED, 'Invalid refresh token');
      }

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'Token refresh failed'
      );
    }
  }
);

/**
 * POST /api/v1/auth/logout
 * Logout and invalidate tokens (client-side token removal)
 */
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    logger.info({ userId }, 'User logged out');

    // In a production system with token blacklisting:
    // await invalidateTokens(userId);

    res.status(204).send();
  } catch (error) {
    logger.error({ error }, 'Logout failed');
    throw new AppError(HttpStatus.INTERNAL_SERVER_ERROR, 'Logout failed');
  }
});

export default router;
