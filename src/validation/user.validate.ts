import { z } from 'zod';

export const userValidator = z.object({
  fullname: z.string().min(1, 'Full name is required').trim(),
  username: z.string().min(3, 'Username must be at least 3 characters').trim(),
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  country: z.string().min(1, 'Country is required').trim(),
  role: z.string().optional(),
  isVIP: z.boolean().optional(),
  vipType: z.string().optional(),
});

export const loginValidator = z.object({
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(1, 'Password is required'),
});

export const userUpdateSchema = z.object({
  fullname: z.string().optional(),
  username: z.string().optional(),
  country: z.string().optional(),
  role: z.string().optional(),
  isVIP: z.boolean().optional(),
  vipType: z.string().optional(),
});

export type UserUpdateInput = z.infer<typeof userUpdateSchema>;