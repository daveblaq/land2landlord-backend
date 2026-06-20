import express from 'express';
import { getAuditLogs } from '../controllers/audit-log.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @openapi
 * /api/audit-logs:
 *   get:
 *     tags:
 *       - Audit Logs
 *     summary: Retrieve paginated audit log entries (Admin/Concierge only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: resource
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by resource type (e.g., PROPERTY, LEAD, USER)
 *       - name: action
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by action (e.g., CREATE, UPDATE, DELETE, LOGIN)
 *       - name: performedBy
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter by performer user ID
 *       - name: page
 *         in: query
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: Audit logs retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - admin or concierge role required
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'concierge'), getAuditLogs);

export default router;
