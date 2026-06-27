import { ILead } from '../models/lead.model';

/**
 * Generate email payload with HTML content to confirm receipt of a lead's request.
 * Sent back directly to the lead (user).
 * 
 * @param lead The lead details
 * @param firstName First name of the lead recipient
 */
export const getLeadAcknowledgementEmailTemplate = (lead: ILead, firstName: string) => {
  return {
    header: `Inquiry Received: ${lead.type} - Landlord2Landlord`,
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Inquiry Received</title>
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
        border-bottom: 2px solid #3185FC; /* Brand blue accent line */
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
        margin: 32px 0 24px 0;
      }
      
      .details-box h3 {
        color: #040013;
        font-size: 13px;
        font-weight: 700;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #E2E8F0;
        padding-bottom: 8px;
      }
      
      .detail-row {
        margin-bottom: 12px;
        font-size: 14px;
        color: #4A5568;
        display: flex;
      }
      
      .detail-row:last-child {
        margin-bottom: 0;
      }
      
      .detail-label {
        font-weight: 700;
        color: #040013;
        width: 120px;
        flex-shrink: 0;
      }
      
      .detail-value {
        word-break: break-all;
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
        <h2 class="title">Hello ${firstName},</h2>
        <p class="paragraph">Thank you for reaching out to Landlord2Landlord. We have successfully received your inquiry and our concierge team is currently reviewing it.</p>
        <p class="paragraph">One of our specialists will get back to you as soon as possible to discuss your request.</p>
        
        <div class="details-box">
          <h3>Your Submission Details</h3>
          <div class="detail-row">
            <div class="detail-label">Inquiry Type:</div>
            <div class="detail-value"><strong>${lead.type}</strong></div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Name:</div>
            <div class="detail-value">${lead.name}</div>
          </div>
          <div class="detail-row">
            <div class="detail-label">Email:</div>
            <div class="detail-value">${lead.email}</div>
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
        
        <p class="paragraph" style="margin-bottom: 0;">We appreciate your patience and look forward to assisting you.</p>
      </div>
      
      <div class="footer">
        <p>This is an automated receipt confirmation from Landlord2Landlord. Please do not reply directly to this email.</p>
        <p>&copy; 2026 Landlord2Landlord. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
  };
};
