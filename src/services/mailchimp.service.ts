import axios from 'axios';
import logger from '../utils/logger';
import { ILead } from '../models/lead.model';

/**
 * Pushes a new lead's details to the Mailchimp Audience/List.
 * This runs as a non-blocking background operation to keep client response times fast.
 * If Mailchimp integration env variables are missing or misconfigured, it fails gracefully.
 * 
 * @param lead The saved lead document
 */
export const pushLeadToMailchimp = async (lead: ILead): Promise<void> => {
  const apiKey = process.env.MAILCHIMP_API_KEY;
  const audienceId = process.env.MAILCHIMP_AUDIENCE_ID;

  // Gracefully skip if Mailchimp integration is not configured
  if (!apiKey || !audienceId) {
    logger.info('Mailchimp integration skipped: MAILCHIMP_API_KEY or MAILCHIMP_AUDIENCE_ID is not set in environment.');
    return;
  }

  // Parse the datacenter (dc) from the API key (e.g. key "xyz-us21" -> dc "us21")
  const apiKeyParts = apiKey.split('-');
  if (apiKeyParts.length < 2) {
    logger.error('Mailchimp integration failed: Invalid API key format. Expected "<key>-<datacenter>" (e.g., abc123abc123-us21).');
    return;
  }
  const dc = apiKeyParts[1];
  const url = `https://${dc}.api.mailchimp.com/3.0/lists/${audienceId}/members`;

  // Safely split name into FNAME (first word) and LNAME (everything else)
  const nameParts = lead.name.trim().split(/\s+/);
  const fname = nameParts[0] || '';
  const lname = nameParts.slice(1).join(' ') || '';

  // Mailchimp basic auth: 'anystring:<api_key>' encoded in base64
  const authHeader = Buffer.from(`anystring:${apiKey}`).toString('base64');

  const payload = {
    email_address: lead.email,
    status: 'subscribed', // Automatically subscribes the lead to receive marketing mails
    merge_fields: {
      FNAME: fname,
      LNAME: lname,
      PHONE: lead.phone || '',
    },
    tags: ['L2L Lead', lead.type],
  };

  try {
    await axios.post(url, payload, {
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
    });
    logger.info(`Successfully pushed lead ${lead.email} to Mailchimp Audience`);
  } catch (err: any) {
    const errorResponse = err.response?.data;
    // Log the detailed Mailchimp error response if available
    logger.error(
      { 
        mailchimpError: errorResponse || err.message,
        statusCode: err.response?.status
      },
      `Failed to push lead ${lead.email} to Mailchimp`
    );
  }
};
