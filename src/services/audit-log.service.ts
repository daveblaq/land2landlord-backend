import AuditLog, { AuditAction, AuditResource } from '../models/audit-log.model';
import { Types } from 'mongoose';

export interface AuditLogPayload {
  performedBy: Types.ObjectId | string;
  performerName: string;
  performerEmail: string;
  performerRole: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceLabel: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Persist an audit log entry. Non-blocking — errors are swallowed
 * so a logging failure never causes an API response to fail.
 */
const log = async (payload: AuditLogPayload): Promise<void> => {
  try {
    await AuditLog.create(payload);
  } catch (err) {
    // Never let audit logging crash the main request flow
    console.error('[AuditLog] Failed to write audit entry:', err);
  }
};

/**
 * Query audit logs with pagination and optional filters.
 */
const queryAuditLogs = async (
  filter: Record<string, unknown>,
  options: { page?: number; limit?: number },
) => {
  const page = options.page ?? 1;
  const limit = Math.min(options.limit ?? 20, 100);
  const skip = (page - 1) * limit;

  const [results, totalResults] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    AuditLog.countDocuments(filter),
  ]);

  return {
    results,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const auditLogService = { log, queryAuditLogs };

export default auditLogService;
