import { Schema, model, Document, Types } from 'mongoose';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE';
export type AuditResource =
  | 'PROPERTY'
  | 'LEAD'
  | 'CONCIERGE'
  | 'USER_PROFILE'
  | 'USER_PASSWORD';

export interface IAuditLog extends Document {
  performedBy: Types.ObjectId;
  performerName: string;
  performerEmail: string;
  performerRole: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId: string;
  resourceLabel: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performerName: {
      type: String,
      required: true,
    },
    performerEmail: {
      type: String,
      required: true,
    },
    performerRole: {
      type: String,
      required: true,
    },
    action: {
      type: String,
      enum: ['CREATE', 'UPDATE', 'DELETE'] as AuditAction[],
      required: true,
    },
    resource: {
      type: String,
      enum: [
        'PROPERTY',
        'LEAD',
        'CONCIERGE',
        'USER_PROFILE',
        'USER_PASSWORD',
      ] as AuditResource[],
      required: true,
    },
    resourceId: {
      type: String,
      required: true,
    },
    resourceLabel: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
    ipAddress: {
      type: String,
    },
  },
  { timestamps: true },
);

// Index for fast dashboard queries
AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ performedBy: 1, createdAt: -1 });
AuditLogSchema.index({ resource: 1, createdAt: -1 });

const AuditLog = model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
