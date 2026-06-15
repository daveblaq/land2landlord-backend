# Landlords2Landlords (V1) - Backend API Services

Welcome to the backend architecture and implementation blueprint for **Landlords2Landlords (V1)**. This repository houses our unified monolithic REST API built entirely using **Node.js**, **TypeScript**, and **MongoDB (Mongoose ODM)**. [cite_start]By adapting our structural parameters away from third-party CMS architectures, this backend serves as our single source of truth for all content, investment metrics, transactional workflows, and analytics tracking[cite: 6, 13].

---

## 1. Overview
[cite_start]**Landlords2Landlords** is a specialized property marketplace engineered to connect landlords, investors, and real estate agents for the fluid sale and purchase of tenanted residential investment properties[cite: 6].

[cite_start]The Minimum Viable Product (MVP) focuses on building a lean, performant, and scalable infrastructure designed to[cite: 7]:
* [cite_start]Display targeted investment property listings[cite: 8].
* [cite_start]Present granular, investor-focused metrics and analytical property data[cite: 9].
* [cite_start]Capture inbound investor enquiries securely[cite: 10].
* [cite_start]Support high-touch, concierge-led operational workflows[cite: 11].
* [cite_start]Manage property inventory systematically[cite: 12].

---

## 2. Technical Stack
* **Runtime:** Node.js (v20+ LTS recommended)
* **Language:** TypeScript (Strict compilation mode)
* **Database Engine:** MongoDB (via Mongoose ODM)
* [cite_start]**Telemetry Data Infrastructure:** PostHog [cite: 280]
* [cite_start]**Transactional Mail Dispatch:** Resend / Specialized Email Service [cite: 282]
* [cite_start]**Serverless Compute Hosting Layer:** Vercel [cite: 283]

---

## 3. Core Backend Services & System Architecture

### Property & Search Service
[cite_start]Manages the validation lifecycle state changes and multi-variable discovery index pipelines across public listings[cite: 27, 42].
* [cite_start]**Property Status State Machine:** `Draft` $\rightarrow$ `Pending Review` $\rightarrow$ `Published` $\rightarrow$ `Under Offer` $\rightarrow$ `Sold` $\rightarrow$ `Archived`[cite: 35].
* [cite_start]**Supported Filtering Combinations:** Location, Price, Monthly Rent, Yield, Property Type, Bedrooms, and Tenancy Status[cite: 47].
* [cite_start]**Sort Configurations:** Engineered using dedicated compound indexing strategies matching `Newest`, `Highest Yield`, `Lowest Price`, and `Highest Price`[cite: 55].

### Lead Management Multiplexer
Acts as our centralized transactional pipeline. [cite_start]Every user interaction across our monetization funnels spawns a parent record inside a unified database collection[cite: 138, 140]:
* [cite_start]**Supported Lead Types:** Property Enquiry, Mortgage Lead, Insurance Lead, Valuation Lead, General Enquiry[cite: 148].
* [cite_start]**Investor Enquiry Workflow Status:** `New` $\rightarrow$ `Contacted` $\rightarrow$ `Qualified` $\rightarrow$ `Viewing Scheduled` $\rightarrow$ `Negotiating` $\rightarrow$ `Closed`[cite: 125].

### Revenue Funnel Services
[cite_start]Captures specific user intent and implements server-side multiplexing logic to route data concurrently to the internal concierge team and external partner endpoints[cite: 154]:
* [cite_start]**Mortgage Lead Service:** Captures budgets and intent arrays; logs to our central database and updates external mortgage broker endpoints[cite: 155, 162].
* [cite_start]**Insurance Lead Service:** Dispatches structural requirement assets directly to a designated insurance partner network[cite: 165, 173].
* [cite_start]**Property Valuation Service:** Captures specific property address coordinates and routes them straight to valuation partners and internal concierge triage queues simultaneously[cite: 175, 181].

---

## 4. Database Schema Design (Mongoose Structures)

### Properties Collection (`properties`)
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IProperty extends Document {
  title: string;
  slug: string;
  description: string;
  property_type: string;
  bedrooms: number;
  bathrooms: number;
  location: string;
  postcode: string;
  tenure: string;
  status: 'Draft' | 'Pending Review' | 'Published' | 'Under Offer' | 'Sold' | 'Archived';
  investment_metrics: {
    asking_price: number;
    monthly_rent: number;
    annual_rent: number; // Programmatic calculation hook: monthly_rent * 12
    gross_yield: number;
    lease_years_remaining?: number;
  };
  tenancy_info: {
    tenanted: boolean;
    tenancy_status?: string;
    tenant_move_in_date?: Date;
    contract_type?: string;
    rent_collection_status?: string;
    arrears_status?: string;
    tenancy_notes?: string;
  };
  financial_info: {
    service_charge: number;
    ground_rent: number;
    council_tax_band: string;
  };
  media_assets: {
    hero_image: string;
    gallery_images: string[];
    documents: {
      epc?: string;
      floorplans?: string[];
      property_packs?: string[];
      compliance_documents?: string[];
    };
  };
}

const PropertySchema = new Schema<IProperty>({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  property_type: { type: String, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  location: { type: String, required: true },
  postcode: { type: String, required: true },
  tenure: { type: String, required: true },
  status: { type: String, enum: ['Draft', 'Pending Review', 'Published', 'Under Offer', 'Sold', 'Archived'], default: 'Draft' },
  investment_metrics: {
    asking_price: { type: Number, required: true },
    monthly_rent: { type: Number, required: true },
    annual_rent: { type: Number, required: true }, // Automatically enforced on save hooks
    gross_yield: { type: Number, required: true },
    lease_years_remaining: { type: Number }
  },
  tenancy_info: {
    tenanted: { type: Boolean, default: true, required: true },
    tenancy_status: { type: String },
    tenant_move_in_date: { type: Date },
    contract_type: { type: String },
    rent_collection_status: { type: String },
    arrears_status: { type: String },
    tenancy_notes: { type: String }
  },
  financial_info: {
    service_charge: { type: Number, default: 0 },
    ground_rent: { type: Number, default: 0 },
    council_tax_band: { type: String, required: true }
  },
  media_assets: {
    hero_image: { type: String, required: true },
    gallery_images: [{ type: String }],
    documents: {
      epc: { type: String },
      floorplans: [{ type: String }],
      property_packs: [{ type: String }],
      compliance_documents: [{ type: String }]
    }
  }
}, { timestamps: true });

// Performance Optimization Indexes
PropertySchema.index({ status: 1, location: 1, property_type: 1 });
PropertySchema.index({ 'investment_metrics.gross_yield': -1 });
PropertySchema.index({ 'investment_metrics.asking_price': 1 });

export const Property = model<IProperty>('Property', PropertySchema);