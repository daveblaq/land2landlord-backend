import { Response } from 'express';
import auditLogService from '../services/audit-log.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { CustomRequest } from '../middleware/auth.middleware';

/**
 * GET /api/audit-logs
 * Returns a paginated list of audit log entries, filterable by resource, action, and performedBy.
 */
export const getAuditLogs = catchAsync(async (req: CustomRequest, res: Response) => {
  const filter: Record<string, unknown> = {};

  if (req.query.resource) filter.resource = req.query.resource;
  if (req.query.action) filter.action = req.query.action;
  if (req.query.performedBy) filter.performedBy = req.query.performedBy;

  const options = {
    page: req.query.page ? Number(req.query.page) : 1,
    limit: req.query.limit ? Number(req.query.limit) : 20,
  };

  const results = await auditLogService.queryAuditLogs(filter, options);

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Audit logs retrieved successfully',
    data: results,
  });
});
