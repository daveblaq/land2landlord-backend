import { Request, Response } from 'express';
import leadService from '../services/lead.service';
import catchAsync from '../utils/catchAsync';
import { createLeadValidator, updateLeadValidator } from '../validation/lead.validate';
import { ZodError } from 'zod';
import httpStatus from 'http-status';

/**
 * Submit / Create a Lead
 */
export const createLead = catchAsync(async (req: Request, res: Response) => {
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
export const updateLead = catchAsync(async (req: Request, res: Response) => {
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
    limit: req.query.limit ? Number(req.query.limit) : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
  };

  const results = await leadService.queryLeads(filter, options);
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Leads list retrieved successfully',
    data: results,
  });
});
