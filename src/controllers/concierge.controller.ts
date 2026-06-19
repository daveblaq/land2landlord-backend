import { Request, Response } from 'express';
import catchAsync from '../utils/catchAsync';
import { userValidator } from '../validation/user.validate';
import { ZodError, z } from 'zod';
import httpStatus from 'http-status';
import crypto from 'crypto';
import User from '../models/user.model';
import { UserTypes } from '../enums/user';
import userService from '../services/user.service';
import emailService from '../utils/sendPulse';
import { getConciergeWelcomeEmailTemplate } from '../mails/auth.mail';
import { CustomRequest } from '../middleware/auth.middleware';
import auditLogService from '../services/audit-log.service';

const generateRandomPassword = (length = 12): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  let password = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
};

const conciergeCreateSchema = z.object({
  fullname: z.string().min(1, 'Full name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  country: z.string().min(1, 'Country is required').trim(),
});

const conciergeUpdateSchema = z.object({
  fullname: z.string().min(1, 'Full name is required').trim().optional(),
  email: z.string().email('Invalid email address').trim().optional(),
  country: z.string().min(1, 'Country is required').trim().optional(),
  status: z.boolean().optional(),
});

// GET /api/concierges
export const getConcierges = catchAsync(async (req: Request, res: Response) => {
  const concierges = await User.find({ role: UserTypes.CONCIERGE });
  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Concierges fetched successfully',
    data: concierges,
  });
});

// POST /api/concierges
export const createConcierge = catchAsync(async (req: CustomRequest, res: Response) => {
  // Validate request body
  try {
    conciergeCreateSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => e.message).join(', '),
        data: null,
      });
    }
  }

  const { email, fullname, country } = req.body;

  // Check email availability
  const isEmailTaken = await User.isEmailTaken(email);
  if (isEmailTaken) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Email is already taken',
      data: null,
    });
  }

  // Generate random password
  const password = generateRandomPassword();

  // Create user with concierge role
  const newConcierge = new User({
    fullname,
    username: email, // Automatically use email as username
    email,
    password,
    country,
    role: UserTypes.CONCIERGE,
    isEmailVerified: true, // Auto-verified for staff
  });

  await newConcierge.save();

  // Send credentials email to the concierge
  const emailData = getConciergeWelcomeEmailTemplate(fullname, email, password);
  await emailService.sendEmail(email, emailData);

  // Remove password from returned object
  const returnedUser = newConcierge.toObject();
  delete returnedUser.password;

  // Audit log
  if (req.user) {
    auditLogService.log({
      performedBy: req.user._id,
      performerName: req.user.fullname,
      performerEmail: req.user.email,
      performerRole: req.user.role,
      action: 'CREATE',
      resource: 'CONCIERGE',
      resourceId: String(newConcierge._id),
      resourceLabel: `${fullname} (${email})`,
      ipAddress: req.ip,
    });
  }

  return res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: 'Concierge created successfully',
    data: returnedUser,
  });
});

// PATCH /api/concierges/:id
export const updateConcierge = catchAsync(async (req: CustomRequest, res: Response) => {
  const { id } = req.params;

  // Find user and verify role
  const concierge = await User.findOne({ _id: id, role: UserTypes.CONCIERGE });
  if (!concierge) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Concierge not found',
      data: null,
    });
  }

  // Validate request body
  try {
    conciergeUpdateSchema.parse(req.body);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: err.errors.map((e) => e.message).join(', '),
        data: null,
      });
    }
  }

  const { email, fullname, country, status } = req.body;

  // Check email availability if changed
  if (email && email !== concierge.email) {
    const isEmailTaken = await User.isEmailTaken(email, id);
    if (isEmailTaken) {
      return res.status(httpStatus.BAD_REQUEST).json({
        status: httpStatus.BAD_REQUEST,
        message: 'Email is already taken',
        data: null,
      });
    }
  }

  // Update fields
  const updateFields: any = {};
  if (fullname !== undefined) updateFields.fullname = fullname;
  if (email !== undefined) {
    updateFields.email = email;
    updateFields.username = email; // Keep username synced with email
  }
  if (country !== undefined) updateFields.country = country;
  if (status !== undefined) updateFields.status = status;

  const updatedConcierge = await userService.updateUser(id, updateFields);

  // Audit log
  if (req.user) {
    auditLogService.log({
      performedBy: req.user._id,
      performerName: req.user.fullname,
      performerEmail: req.user.email,
      performerRole: req.user.role,
      action: 'UPDATE',
      resource: 'CONCIERGE',
      resourceId: id,
      resourceLabel: `${concierge.fullname} (${concierge.email})`,
      metadata: { updatedFields: Object.keys(updateFields) },
      ipAddress: req.ip,
    });
  }

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Concierge updated successfully',
    data: updatedConcierge,
  });
});

// DELETE /api/concierges/:id
export const deleteConcierge = catchAsync(async (req: CustomRequest, res: Response) => {
  const { id } = req.params;

  // Find user and verify role
  const concierge = await User.findOne({ _id: id, role: UserTypes.CONCIERGE });
  if (!concierge) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Concierge not found',
      data: null,
    });
  }

  await userService.deleteUser(id);

  // Audit log
  if (req.user) {
    auditLogService.log({
      performedBy: req.user._id,
      performerName: req.user.fullname,
      performerEmail: req.user.email,
      performerRole: req.user.role,
      action: 'DELETE',
      resource: 'CONCIERGE',
      resourceId: id,
      resourceLabel: `${concierge.fullname} (${concierge.email})`,
      ipAddress: req.ip,
    });
  }

  return res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Concierge deleted successfully',
    data: null,
  });
});
