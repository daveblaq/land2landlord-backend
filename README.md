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
* **Media Storage:** Cloudinary
* **Transactional Mail Dispatch:** SendPulse
* **Marketing/CRM Sync:** Mailchimp
* **Compute Hosting Layer:** Render / Google Cloud Platform (build scripts target both `render-postbuild` and `gcp-build`)

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

The real, current schema lives in [`src/models/property.model.ts`](src/models/property.model.ts). Field names are camelCase (not the snake_case shown in earlier drafts of this document), and the schema is flatter — tenancy, financial, and media fields sit directly on the document rather than nested under `tenancy_info`/`financial_info`/`media_assets` sub-objects:

```typescript
export interface IProperty extends Document {
  title: string;
  slug: string;
  description: any; // Mixed: plain string or rich text block structure
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
    annualRent: number;      // auto-calculated: monthlyRent * 12 (pre-save hook)
    grossYield: number;       // auto-calculated: (annualRent / askingPrice) * 100 (pre-save hook)
    leaseYearsRemaining?: number;
  };
  serviceCharge: number;
  groundRent: number;
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
  createdBy?: Schema.Types.ObjectId;
}
```

Indexes: `{ status, location, propertyType }` (compound), `investmentMetrics.grossYield` (desc), `investmentMetrics.askingPrice` (asc). The slug is auto-generated from `title` with a random suffix to avoid collisions, and `annualRent`/`grossYield` are recalculated on every save — clients should not rely on setting these directly.

See [`src/models/user.model.ts`](src/models/user.model.ts), [`src/models/lead.model.ts`](src/models/lead.model.ts), and [`src/models/audit-log.model.ts`](src/models/audit-log.model.ts) for the other collections.