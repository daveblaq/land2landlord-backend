/**
 * Generate email payload with HTML content to send an EPC certificate link or other property documents to a lead.
 * Maintains the exact design system/brand identity of the welcome templates.
 * 
 * @param firstName Recipient's first name
 * @param propertyTitle Title of the property
 * @param documentUrl Direct download URL of the certificate/document
 * @param documentName Name of the document (default: 'Energy Performance Certificate (EPC)')
 */
export const getEpcCertificateEmailTemplate = (
  firstName: string,
  propertyTitle: string,
  documentUrl: string,
  documentName: string = 'Energy Performance Certificate (EPC)'
) => {
  const isEpc = documentName.toLowerCase().includes('epc') || documentName.toLowerCase().includes('energy');
  const actionText = isEpc ? 'Download EPC Certificate' : `Download ${documentName}`;

  return {
    header: `Your Requested Document: ${documentName} - ${propertyTitle}`,
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${documentName}</title>
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
        border-bottom: 2px solid #3185FC;
      }
      
      .logo {
        font-size: 24px;
        font-weight: 800;
        letter-spacing: -0.5px;
        color: #040013;
      }
      
      .logo-brand {
        color: #040013;
      }
      
      .logo-accent {
        color: #3185FC;
      }
      
      .logo-number {
        color: #FF8400;
        background: rgba(255, 132, 0, 0.08);
        padding: 2px 8px;
        margin: 0 2px;
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
      
      .highlight-box {
        background-color: #F7FAFC;
        border: 1px solid #E2E8F0;
        border-left: 4px solid #3185FC;
        padding: 24px;
        margin: 32px 0;
      }
      
      .highlight-box h3 {
        color: #040013;
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .highlight-box p {
        color: #4A5568;
        font-size: 14px;
        margin-bottom: 8px;
      }
      
      .highlight-box p:last-child {
        margin-bottom: 0;
      }
      
      .btn {
        display: inline-block;
        background-color: #3185FC;
        color: #ffffff !important;
        text-decoration: none;
        padding: 14px 28px;
        font-weight: 700;
        font-size: 14px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-top: 8px;
        text-align: center;
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
      
      .footer a {
        color: #3185FC;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="header">
        <div class="logo">
          <span class="logo-brand">Landlord</span><span class="logo-number">2</span><span class="logo-accent">Landlord</span>
        </div>
      </div>
      
      <div class="content">
        <h2 class="title">Hello ${firstName},</h2>
        <p class="paragraph">As requested from the Landlord2Landlord platform, here is your direct link to download the document for <strong>${propertyTitle}</strong>.</p>
        
        <div class="highlight-box">
          <h3>Request Summary</h3>
          <p><strong>Property:</strong> ${propertyTitle}</p>
          <p><strong>Document Name:</strong> ${documentName}</p>
          <p><strong>Status:</strong> Available for immediate download</p>
        </div>
        
        <p class="paragraph" style="margin-bottom: 16px;">To open or download the requested document, click the button below:</p>
        <a href="${documentUrl}" class="btn" target="_blank">${actionText}</a>
      </div>
      
      <div class="footer">
        <p>This is an automated message. Please do not reply directly to this email.</p>
        <p>&copy; 2026 Landlord2Landlord. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
  };
};
