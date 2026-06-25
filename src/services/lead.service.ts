import { Lead, ILead } from '../models/lead.model';
import { Property } from '../models/property.model';
import emailService from '../utils/sendPulse';
import partnerService from './partner.service';
import logger from '../utils/logger';
import { pushLeadToMailchimp } from './mailchimp.service';

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

  // 3. Push to Mailchimp (Non-blocking background task)
  pushLeadToMailchimp(lead).catch((err) => {
    logger.error(err, 'Unhandled exception during Mailchimp lead push');
  });

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
  const limit = options.limit !== undefined && options.limit >= 0 ? options.limit : 10;
  const page = options.page && options.page > 0 ? options.page : 1;

  const totalResults = await Lead.countDocuments(filter);

  let results;
  if (limit === 0) {
    results = await Lead.find(filter).sort({ createdAt: -1 });
  } else {
    const skip = (page - 1) * limit;
    results = await Lead.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  return {
    results,
    page,
    limit,
    totalPages: limit === 0 ? 1 : Math.ceil(totalResults / limit),
    totalResults,
  };
};

/**
 * Get lead status counts/stats
 */
const getLeadStats = async (filter: any): Promise<Record<string, number>> => {
  const stats = await Lead.aggregate([
    { $match: filter },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const statuses = ['New', 'Contacted', 'Qualified', 'Viewing Scheduled', 'Negotiating', 'Closed'];
  const data = Object.fromEntries(statuses.map((s) => [s, 0]));

  stats.forEach((item) => {
    if (item._id && statuses.includes(item._id)) {
      data[item._id] = item.count;
    }
  });

  return data;
};

/**
 * Add a note to a lead, capturing current lead and property statuses
 */
const addNoteToLead = async (
  leadId: string,
  noteContent: string,
  user: { _id: string; fullname: string; role: string }
): Promise<ILead | null> => {
  const lead = await Lead.findById(leadId);
  if (!lead) return null;

  let propertyStatus: string | undefined = undefined;
  if (lead.metadata && lead.metadata.propertyId) {
    const property = await Property.findById(lead.metadata.propertyId);
    if (property) {
      propertyStatus = property.status;
    }
  }

  const newNote = {
    content: noteContent,
    submittedBy: {
      userId: user._id,
      name: user.fullname,
      role: user.role,
    },
    capturedStatus: {
      leadStatus: lead.status,
      propertyStatus,
    },
    createdAt: new Date(),
  };

  if (!lead.notes) {
    lead.notes = [];
  }
  lead.notes.push(newNote as any);
  await lead.save();

  return lead;
};

const leadService = {
  createLead,
  getLeadById,
  updateLeadById,
  queryLeads,
  getLeadStats,
  addNoteToLead,
};

export default leadService;
