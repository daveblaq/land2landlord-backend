import { Schema, model, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  email: string;
  phone?: string;
  type: 'Property Enquiry' | 'Mortgage Lead' | 'Insurance Lead' | 'Valuation Lead' | 'General Enquiry';
  status: 'New' | 'Contacted' | 'Qualified' | 'Viewing Scheduled' | 'Negotiating' | 'Closed';
  message?: string;
  metadata?: Record<string, any>;
}

const LeadSchema = new Schema<ILead>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  type: {
    type: String,
    enum: ['Property Enquiry', 'Mortgage Lead', 'Insurance Lead', 'Valuation Lead', 'General Enquiry'],
    required: true
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Viewing Scheduled', 'Negotiating', 'Closed'],
    default: 'New',
    required: true
  },
  message: { type: String, trim: true },
  metadata: { type: Schema.Types.Mixed, default: {} }
}, { timestamps: true });

// Performance Optimization Index
LeadSchema.index({ type: 1, status: 1 });
LeadSchema.index({ email: 1 });

export const Lead = model<ILead>('Lead', LeadSchema);
