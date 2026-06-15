import express from 'express';
import { getStats } from '../controllers/stats.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @openapi
 * /api/stats:
 *   get:
 *     tags:
 *       - Stats
 *     summary: Retrieve aggregate portfolio stats and leads metrics
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'concierge'), getStats);

export default router;
