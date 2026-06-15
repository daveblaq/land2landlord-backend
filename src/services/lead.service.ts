import { Lead, ILead } from '../models/lead.model';
import emailService from '../utils/sendPulse';
import partnerService from './partner.service';
import logger from '../utils/logger';

/**
 * Generate email payload for the internal concierge team
 */
const getConciergeEmailTemplate = (lead: ILead) => {
  return {
    header: `[L2L Lead Multiplexer] New Lead: ${lead.type}`,
    body: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #2D3748; border-bottom: 2px solid #E2E8F0; padding-bottom: 10px;">New Lead Captured</h2>
        <p><strong>Lead ID:</strong> ${lead._id}</p>
        <p><strong>Type:</strong> ${lead.type}</p>
        <p><strong>Name:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Phone:</strong> ${lead.phone || 'N/A'}</p>
        <p><strong>Message/Notes:</strong> ${lead.message || 'N/A'}</p>
        
        <h3 style="color: #4A5568; margin-top: 20px;">Lead Metadata</h3>
        <pre style="background: #F7FAFC; padding: 10px; border: 1px solid #E2E8F0; border-radius: 4px; overflow-x: auto;">
${JSON.stringify(lead.metadata, null, 2)}
        </pre>
      </div>
    `
  };
};

/**
 * Create a new lead and trigger multiplexer routing
 */
const createLead = async (leadBody: Partial<ILead>): Promise<ILead> => {
  const lead = await Lead.create(leadBody);

  // 1. Notify Concierge Team via Email
  const conciergeEmail = process.env.SENDER_EMAIL;
  if (conciergeEmail) {
    const emailPayload = getConciergeEmailTemplate(lead);
    try {
      emailService.sendEmail(conciergeEmail, emailPayload);
    } catch (err) {
      logger.error(err, 'Failed to dispatch concierge email alert');
    }
  }

  // 2. Multiplexer: Route to External Partners concurrently based on Type
  const partnerPayload = {
    leadId: lead._id.toString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    message: lead.message,
    metadata: lead.metadata || {},
  };

  try {
    if (lead.type === 'Mortgage Lead') {
      partnerService.routeMortgageLead(partnerPayload);
    } else if (lead.type === 'Insurance Lead') {
      partnerService.routeInsuranceLead(partnerPayload);
    } else if (lead.type === 'Valuation Lead') {
      partnerService.routeValuationLead(partnerPayload);
    }
  } catch (err) {
    logger.error(err, 'Failed to route lead to external partner');
  }

  return lead;
};

/**
 * Get lead by ID
 */
const getLeadById = async (id: string): Promise<ILead | null> => {
  return Lead.findById(id);
};

/**
 * Update lead status or fields (for internal concierge triage)
 */
const updateLeadById = async (id: string, updateBody: Partial<ILead>): Promise<ILead | null> => {
  return Lead.findByIdAndUpdate(id, updateBody, { new: true });
};

/**
 * Query leads with pagination (for admin search views)
 */
const queryLeads = async (filter: any, options: { limit?: number; page?: number }) => {
  const limit = options.limit && options.limit > 0 ? options.limit : 10;
  const page = options.page && options.page > 0 ? options.page : 1;
  const skip = (page - 1) * limit;

  const totalResults = await Lead.countDocuments(filter);
  const results = await Lead.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    results,
    page,
    limit,
    totalPages: Math.ceil(totalResults / limit),
    totalResults,
  };
};

const leadService = {
  createLead,
  getLeadById,
  updateLeadById,
  queryLeads,
};

export default leadService;
