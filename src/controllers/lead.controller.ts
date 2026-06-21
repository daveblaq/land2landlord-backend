import { Request, Response } from 'express';
import leadService from '../services/lead.service';
import catchAsync from '../utils/catchAsync';
import { createLeadValidator, updateLeadValidator, createLeadBulkValidator } from '../validation/lead.validate';
import { ZodError } from 'zod';
import httpStatus from 'http-status';
import { CustomRequest } from '../middleware/auth.middleware';
import auditLogService from '../services/audit-log.service';

/**
 * Submit / Create a Lead
 */
export const createLead = catchAsync(async (req: CustomRequest, res: Response) => {
  try {
    createLeadValidator.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        data: null,
      });
    }
  }

  const lead = await leadService.createLead(req.body);

  // Audit log (only if performed by an authenticated CMS user, not a public form submission)
  if (req.user) {
    auditLogService.log({
      performedBy: req.user._id,
      performerName: req.user.fullname,
      performerEmail: req.user.email,
      performerRole: req.user.role,
      action: 'CREATE',
      resource: 'LEAD',
      resourceId: String(lead._id),
      resourceLabel: `${lead.name} — ${lead.type}`,
      ipAddress: req.ip,
    });
  }

  return res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: 'Lead submitted successfully',
    data: lead,
  });
});

/**
 * Retrieve Lead Details
 */
export const getLead = catchAsync(async (req: Request, res: Response) => {
  const lead = await leadService.getLeadById(req.params.id);
  if (!lead) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Lead not found',
      data: null,
    });
  }

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Lead retrieved successfully',
    data: lead,
  });
});

/**
 * Update Lead Status / Workflow (Concierge Action)
 */
export const updateLead = catchAsync(async (req: CustomRequest, res: Response) => {
  try {
    updateLeadValidator.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
        data: null,
      });
    }
  }

  const lead = await leadService.updateLeadById(req.params.id, req.body);
  if (!lead) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Lead not found',
      data: null,
    });
  }

  // Audit log
  if (req.user) {
    auditLogService.log({
      performedBy: req.user._id,
      performerName: req.user.fullname,
      performerEmail: req.user.email,
      performerRole: req.user.role,
      action: 'UPDATE',
      resource: 'LEAD',
      resourceId: req.params.id,
      resourceLabel: `${lead.name} — ${lead.type}`,
      metadata: {
        updatedFields: Object.keys(req.body),
        newStatus: lead.status,
      },
      ipAddress: req.ip,
    });
  }

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Lead status updated successfully',
    data: lead,
  });
});

/**
 * Query Leads (Dashboard Action)
 */
export const getLeads = catchAsync(async (req: Request, res: Response) => {
  const filter: any = {};
  if (req.query.type) {
    filter.type = req.query.type;
  }
  if (req.query.status) {
    filter.status = req.query.status;
  }
  if (req.query.email) {
    filter.email = { $regex: req.query.email as string, $options: 'i' };
  }

  const options = {
    limit: req.query.limit !== undefined ? Number(req.query.limit) : undefined,
    page: req.query.page !== undefined ? Number(req.query.page) : undefined,
  };

  const results = await leadService.queryLeads(filter, options);
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Leads list retrieved successfully',
    data: results,
  });
});

/**
 * Get Lead Stats (Status Counts)
 */
export const getLeadStats = catchAsync(async (req: Request, res: Response) => {
  const filter: any = {};
  if (req.query.type) {
    if (Array.isArray(req.query.type)) {
      filter.type = { $in: req.query.type };
    } else {
      filter.type = req.query.type;
    }
  }
  if (req.query.email) {
    filter.email = { $regex: req.query.email as string, $options: 'i' };
  }

  const stats = await leadService.getLeadStats(filter);
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Lead stats retrieved successfully',
    data: stats,
  });
});

/**
 * Add note to a Lead (Admin/Concierge action)
 */
export const addLeadNote = catchAsync(async (req: CustomRequest, res: Response) => {
  const { content } = req.body;
  if (!content || typeof content !== 'string' || content.trim() === '') {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Note content is required',
      data: null,
    });
  }

  const lead = await leadService.addNoteToLead(req.params.id, content, req.user);
  if (!lead) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Lead not found',
      data: null,
    });
  }

  // Audit log
  auditLogService.log({
    performedBy: req.user._id,
    performerName: req.user.fullname,
    performerEmail: req.user.email,
    performerRole: req.user.role,
    action: 'UPDATE',
    resource: 'LEAD',
    resourceId: req.params.id,
    resourceLabel: `${lead.name} — Added Note`,
    metadata: {
      noteContent: content,
    },
    ipAddress: req.ip,
  });

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Note added successfully',
    data: lead,
  });
});

/**
 * Bulk Create Leads
 */
export const createLeadsBulk = catchAsync(async (req: CustomRequest, res: Response) => {
  const { leads } = req.body;

  if (!leads || !Array.isArray(leads)) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'leads must be an array of lead objects',
      data: null,
    });
  }

  if (leads.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'leads array cannot be empty',
      data: null,
    });
  }

  const errors: string[] = [];
  leads.forEach((lead, index) => {
    try {
      createLeadBulkValidator.parse(lead);
    } catch (err) {
      if (err instanceof ZodError) {
        const rowErrors = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
        errors.push(`Row ${index + 1}: ${rowErrors}`);
      } else {
        errors.push(`Row ${index + 1}: ${(err as Error).message}`);
      }
    }
  });

  if (errors.length > 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Validation failed for some leads',
      data: { errors },
    });
  }

  const createdLeads = [];
  for (const leadData of leads) {
    const lead = await leadService.createLead(leadData);
    createdLeads.push(lead);

    // Audit log
    if (req.user) {
      auditLogService.log({
        performedBy: req.user._id,
        performerName: req.user.fullname,
        performerEmail: req.user.email,
        performerRole: req.user.role,
        action: 'CREATE',
        resource: 'LEAD',
        resourceId: String(lead._id),
        resourceLabel: `(Bulk) ${lead.name} — ${lead.type}`,
        ipAddress: req.ip,
      });
    }
  }

  return res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: `Successfully uploaded ${createdLeads.length} leads`,
    data: createdLeads,
  });
});

