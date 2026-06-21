import { z } from 'zod';

export const createLeadBulkValidator = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  phone: z.string().optional(),
  type: z.enum(['Property Enquiry', 'Mortgage Lead', 'Insurance Lead', 'Valuation Lead', 'General Enquiry']),
  status: z.enum(['New', 'Contacted', 'Qualified', 'Viewing Scheduled', 'Negotiating', 'Closed']).optional(),
  message: z.string().optional(),
  metadata: z.record(z.any()).optional().default({})
});

export const createLeadValidator = createLeadBulkValidator.superRefine((data, ctx) => {
  if (data.type === 'Property Enquiry') {
    if (!data.metadata || !data.metadata.propertyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata', 'propertyId'],
        message: 'propertyId is required for Property Enquiry leads'
      });
    }
  } else if (data.type === 'Mortgage Lead') {
    if (!data.metadata || data.metadata.budget === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata', 'budget'],
        message: 'budget is required for Mortgage Leads'
      });
    }
    if (!data.metadata || !data.metadata.intent) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata', 'intent'],
        message: 'intent is required for Mortgage Leads'
      });
    }
  } else if (data.type === 'Insurance Lead') {
    if (!data.metadata || !data.metadata.structuralRequirements) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata', 'structuralRequirements'],
        message: 'structuralRequirements is required for Insurance Leads'
      });
    }
  } else if (data.type === 'Valuation Lead') {
    if (!data.metadata || !data.metadata.propertyAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['metadata', 'propertyAddress'],
        message: 'propertyAddress is required for Valuation Leads'
      });
    }
  }
});

export const updateLeadValidator = z.object({
  status: z.enum(['New', 'Contacted', 'Qualified', 'Viewing Scheduled', 'Negotiating', 'Closed']).optional(),
  message: z.string().optional()
});
