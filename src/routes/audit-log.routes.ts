import express from 'express';
import { getAuditLogs } from '../controllers/audit-log.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware';

const router = express.Router();

/**
 * @route   GET /api/audit-logs
 * @desc    Retrieve paginated audit log entries. Filterable by resource, action, performedBy.
 * @access  Private (Admin + Concierge)
 */
router.get('/', authenticateToken, authorizeRoles('admin', 'concierge'), getAuditLogs);

export default router;
