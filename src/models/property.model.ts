import { Schema, model, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  slug: string;
  description: any; // Mixed to support both plain string and rich text block structure from Sanity
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  address: string;
  location: string;
  postcode: string;
  tenure: string;
  heroImage: string;
  gallery: any[];
  investmentMetrics: {
    askingPrice: number;
    monthlyRent: number;
    annualRent: number;
    grossYield: number;
    leaseYearsRemaining?: number;
  };
  serviceCharge: number;
  groundRent: number;
  insuranceCostMonthly?: number;
  councilTaxBand?: string;
  tenented: boolean;
  tenancyStatus?: string;
  tenantMoveInDate?: Date;
  contractType?: string;
  rentCollectionStatus?: string;
  arrearsStatus?: string;
  tenancyNotes?: string;
  epc?: string;
  potentialEpc?: string;
  priceType?: 'guide-price' | 'fixed-price' | 'offers-over';
  tenancyStartDate?: Date;
  tenancyType?: string;
  fixedTermEndDate?: Date;
  rentPaymentStatus?: 'up-to-date' | 'partially-paid' | 'overdue';
  depositProtected?: boolean;
  noticeServed?: boolean;
  tenantWantsToStay?: 'yes' | 'no' | 'unknown';
  viewingArrangements?: 'vacant-access' | 'accompanied' | 'tenant-notify-24h' | 'tenant-notify-48h';
  rentReviewDate?: Date;
  compliance?: any;
  mediaFiles?: any[];
  floorplans: any[];
  propertyPacks: any[];
  complianceDocuments: any[];
  status: 'draft' | 'pending-review' | 'published' | 'under-offer' | 'sold' | 'archived';
  displayOnHomepage: boolean;
  isFeatured: boolean;
  isHighYield: boolean;
  latitude?: number;
  longitude?: number;
  location_geo?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat] — GeoJSON order
  };
  createdBy?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema = new Schema<IProperty>({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  description: { type: Schema.Types.Mixed, required: true },
  propertyType: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  sqft: { type: Number, required: true },
  address: { type: String, required: true, trim: true },
  location: { type: String, required: true },
  postcode: { type: String, required: true },
  tenure: { type: String, required: true },
  heroImage: { type: String, required: false },
  gallery: [{ type: Schema.Types.Mixed, default: [] }],
  investmentMetrics: {
    askingPrice: { type: Number, required: true },
    monthlyRent: { type: Number, required: true },
    annualRent: { type: Number }, // Calculated dynamically on save
    grossYield: { type: Number },  // Calculated dynamically on save
    leaseYearsRemaining: { type: Number }
  },
  serviceCharge: { type: Number, default: 0 },
  groundRent: { type: Number, default: 0 },
  insuranceCostMonthly: { type: Number, default: 0 },
  councilTaxBand: { type: String },
  tenented: { type: Boolean, default: true, required: true },
  tenancyStatus: { type: String },
  tenantMoveInDate: { type: Date },
  contractType: { type: String },
  rentCollectionStatus: { type: String },
  arrearsStatus: { type: String, default: 'no-arrears' },
  tenancyNotes: { type: String },
  epc: { type: String },
  potentialEpc: { type: String },
  priceType: { type: String, enum: ['guide-price', 'fixed-price', 'offers-over'] },
  tenancyStartDate: { type: Date },
  tenancyType: { type: String },
  fixedTermEndDate: { type: Date },
  rentPaymentStatus: { type: String, enum: ['up-to-date', 'partially-paid', 'overdue'] },
  depositProtected: { type: Boolean },
  noticeServed: { type: Boolean },
  tenantWantsToStay: { type: String, enum: ['yes', 'no', 'unknown'] },
  viewingArrangements: { type: String, enum: ['vacant-access', 'accompanied', 'tenant-notify-24h', 'tenant-notify-48h'] },
  rentReviewDate: { type: Date },
  compliance: { type: Schema.Types.Mixed },
  mediaFiles: [{ type: Schema.Types.Mixed, default: [] }],
  floorplans: [{ type: Schema.Types.Mixed, default: [] }],
  propertyPacks: [{ type: Schema.Types.Mixed, default: [] }],
  complianceDocuments: [{ type: Schema.Types.Mixed, default: [] }],
  status: { 
    type: String, 
    enum: ['draft', 'pending-review', 'published', 'under-offer', 'sold', 'archived'], 
    default: 'draft' 
  },
  displayOnHomepage: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  isHighYield: { type: Boolean, default: false },
  latitude: { type: Number },
  longitude: { type: Number },
  location_geo: {
    type: { type: String, enum: ['Point'], default: undefined },
    coordinates: { type: [Number], default: undefined },
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Performance Optimization Indexes
PropertySchema.index({ status: 1, location: 1, propertyType: 1 });
PropertySchema.index({ 'investmentMetrics.grossYield': -1 });
PropertySchema.index({ 'investmentMetrics.askingPrice': 1 });
PropertySchema.index({ location_geo: '2dsphere' });

// Helper to slugify a string
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

// Auto calculate metrics and slugify on pre-save
PropertySchema.pre('save', function (next) {
  // Always calculate rent metrics
  if (this.investmentMetrics.monthlyRent) {
    this.investmentMetrics.annualRent = this.investmentMetrics.monthlyRent * 12;
  }
  
  if (this.investmentMetrics.askingPrice && this.investmentMetrics.annualRent) {
    this.investmentMetrics.grossYield = parseFloat(
      ((this.investmentMetrics.annualRent / this.investmentMetrics.askingPrice) * 100).toFixed(2)
    );
  } else {
    this.investmentMetrics.grossYield = 0;
  }

  // Auto-slugify
  if (!this.slug || this.isModified('title')) {
    const baseSlug = slugify(this.title);
    // Append unique suffix to prevent slug collisions
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    this.slug = `${baseSlug}-${randomSuffix}`;
  }

  // Keep location_geo in sync with latitude/longitude for $geoWithin radius queries
  if (
    typeof this.latitude === 'number' && !Number.isNaN(this.latitude) &&
    typeof this.longitude === 'number' && !Number.isNaN(this.longitude)
  ) {
    this.location_geo = {
      type: 'Point',
      coordinates: [this.longitude, this.latitude],
    };
  } else {
    this.location_geo = undefined;
  }

  next();
});

export const Property = model<IProperty>('Property', PropertySchema);
