import { Router } from 'express';
import healthRoutes from './health';

const router: Router = Router();

/**
 * Mount all API routes
 *
 * Structure:
 * - /health - Health check endpoints
 * - /auth - Authentication endpoints (will be added in US1)
 * - /stories - Story CRUD endpoints (will be added in US1)
 * - /library - Library management endpoints (will be added in US3)
 * - /settings - User and parental settings endpoints (will be added in US4)
 */

// Health check (no authentication required)
router.use('/health', healthRoutes);

// Placeholder for future routes
// router.use('/auth', authRoutes);
// router.use('/stories', authenticate, storyRoutes);
// router.use('/library', authenticate, libraryRoutes);
// router.use('/settings', authenticate, settingsRoutes);

export default router;
