import { Router } from 'express';
import healthRoutes from './health';
import authRoutes from './auth';
import storyRoutes from './stories';

const router: Router = Router();

/**
 * Mount all API routes
 *
 * Structure:
 * - /health - Health check endpoints
 * - /auth - Authentication endpoints
 * - /stories - Story CRUD endpoints
 * - /library - Library management endpoints (will be added in US3)
 * - /settings - User and parental settings endpoints (will be added in US4)
 */

// Health check (no authentication required)
router.use('/health', healthRoutes);

// Authentication (no authentication required)
router.use('/auth', authRoutes);

// Stories (authentication required - handled by routes)
router.use('/stories', storyRoutes);

// Placeholder for future routes
// router.use('/library', libraryRoutes);
// router.use('/settings', settingsRoutes);

export default router;
