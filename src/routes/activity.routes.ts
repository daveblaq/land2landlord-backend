import express from 'express';
import { getRecentActivities } from '../controllers/activity.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @openapi
 * /api/activities:
 *   get:
 *     tags:
 *       - Activities
 *     summary: Retrieve recent activities for the dashboard
 *     responses:
 *       200:
 *         description: Recent activities retrieved successfully
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'concierge'), getRecentActivities);

export default router;
