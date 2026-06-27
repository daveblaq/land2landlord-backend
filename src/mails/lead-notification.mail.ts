import { ILead } from '../models/lead.model';

/**
 * Generate email payload with HTML content to notify admins and concierges of a new lead.
 * Maintains the exact design system/brand identity of the welcome templates.
 * 
 * @param lead The captured lead details
 * @param recipientName Name of the admin or concierge recipient
 */
export const getLeadNotificationEmailTemplate = (lead: ILead, recipientName: string) => {
  const ctaUrl = `${process.env.CMS_URL}/dashboard/leads/${lead._id}`;
  
  // Format metadata nicely if it exists
  const hasMetadata = lead.metadata && Object.keys(lead.metadata).length > 0;
  const metadataHtml = hasMetadata 
    ? `<div class="metadata-section">
         <h3>Lead Metadata</h3>
         <pre class="metadata-block">${JSON.stringify(lead.metadata, null, 2)}</pre>
       </div>`
    : '';

  return {
    header: `[New Lead Alert] ${lead.type} - ${lead.name}`,
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Lead Captured</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.7;
        background-color: #F8F9FA;
        color: #2D3748;
        margin: 0;
        padding: 40px 20px;
        -webkit-font-smoothing: antialiased;
      }
      
      .email-wrapper {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #E2E8F0;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      }
      
      .header {
        background-color: #ffffff;
        padding: 32px 24px;
        text-align: center;
        border-bottom: 2px solid #FF8400; /* Distinct orange accent line for alerts */
      }
      
      .logo-img {
        display: block;
        margin: 0 auto;
        height: 36px;
        max-height: 36px;
        width: auto;
        border: 0;
      }
      
      .content {
        padding: 48px 40px;
      }
      
      .alert-badge {
        display: inline-block;
        background-color: rgba(255, 132, 0, 0.08);
        color: #FF8400;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1px;
        padding: 6px 14px;
        border-radius: 4px;
        margin-bottom: 20px;
      }
      
      .title {
        color: #040013;
        font-size: 22px;
        font-weight: 700;
        margin-bottom: 20px;
        letter-spacing: -0.5px;
      }
      
      .paragraph {
        color: #4A5568;
        font-size: 15px;
        margin-bottom: 24px;
      }
      
      .details-box {
        background-color: #F7FAFC;
        border: 1px solid #E2E8F0;
        border-left: 4px solid #3185FC;
        padding: 24px;
        margin: 32px 0 20px 0;
      }
      
      .details-box h3 {
        color: #040013;
        font-size: 14px;
        font-weight: 700;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #E2E8F0;
        padding-bottom: 8px;
      }
      
      .detail-row {
        margin-bottom: 16px;
        font-size: 14px;
        color: #4A5568;
      }
      
      .detail-row:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        font-weight: 700;
        color: #040013;
        margin-bottom: 2px;
      }
      
      .detail-value {
        word-break: break-word;
      }
      
      .metadata-section {
        margin-bottom: 32px;
      }
      
      .metadata-section h3 {
        color: #040013;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .metadata-block {
        font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
        background-color: #F8F9FA;
        border: 1px solid #E2E8F0;
        padding: 16px;
        font-size: 12px;
        color: #2D3748;
        border-radius: 4px;
        overflow-x: auto;
        white-space: pre-wrap;
        word-break: break-all;
      }
      
      .btn {
        display: block;
        background-color: #3185FC;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 28px;
        font-weight: 700;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: center;
        margin-top: 10px;
      }
      
      .footer {
        background-color: #ffffff;
        color: #718096;
        padding: 32px 24px;
        text-align: center;
        font-size: 12px;
        border-top: 1px solid #E2E8F0;
      }
      
      .footer p {
        color: #718096;
        margin-bottom: 8px;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="header">
        <img class="logo-img" src="https://res.cloudinary.com/dd1damszz/image/upload/v1782435869/logo_rd2i4q.svg" alt="Landlord2Landlord" />
      </div>
      
      <div class="content">
        <div class="alert-badge">New Lead captured</div>
        <h2 class="title">Hello ${recipientName},</h2>
        <p class="paragraph">A new lead has been submitted on the Landlord2Landlord platform. Please find the details below:</p>
        
        <div class="details-box">
          <h3>Lead Details</h3>
          <div class="detail-row">
            <div class="detail-label">Lead ID:</div>
            <div class="detail-value">${lead._id}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Lead Type:</div>
            <div class="detail-value"><strong>${lead.type}</strong></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">${lead.name}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value"><a href="mailto:${lead.email}" style="color: #3185FC; text-decoration: none;">${lead.email}</a></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Phone:</div>
            <div class="detail-value">${lead.phone || 'N/A'}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Message:</div>
            <div class="detail-value">${lead.message || 'N/A'}</div>
          </div>
        </div>
        
        ${metadataHtml}
        
        <a href="${ctaUrl}" class="btn" target="_blank">Manage Lead in CMS</a>
      </div>
      
      <div class="footer">
        <p>This is an automated system notification from the Landlord2Landlord CMS.</p>
        <p>&copy; 2026 Landlord2Landlord. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
  };
};
