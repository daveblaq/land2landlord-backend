export const getWelcomeEmailTemplate = (firstName: string) => {
  return {
    header: 'Welcome to Landlord2Landlord!',
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Landlord2Landlord</title>
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
        font-size: 24px;
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
        border: 1px solid #3185FC;
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
        <h2 class="title">Welcome to the Platform, ${firstName}!</h2>
        <p class="paragraph">Your Landlord2Landlord account has been successfully created. We are excited to help you streamline your property investments and deals.</p>
        
        <div class="highlight-box">
          <h3>Verification & Security Status</h3>
          <p>• Your email address is now verified</p>
          <p>• Advanced security protocols are active</p>
          <p>• Your investor/landlord profile is ready for setup</p>
        </div>
        
        <p class="paragraph" style="margin-bottom: 16px;">To start listing your properties, analyzing off-market deals, or connecting with verified landlords, log in to your account dashboard now:</p>
        <a href="${process.env.WEBSITE_URL}" class="btn">Explore the Dashboard</a>
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

export const getConciergeWelcomeEmailTemplate = (fullname: string, email: string, password: string) => {
  return {
    header: 'Welcome to Landlord2Landlord! Your concierge account is ready.',
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to the Team</title>
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
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 20px;
        letter-spacing: -0.5px;
      }
      
      .paragraph {
        color: #4A5568;
        font-size: 15px;
        margin-bottom: 24px;
      }
      
      .credentials-box {
        background-color: #FFFDF9;
        border: 1px solid #FF8400;
        padding: 24px;
        margin: 32px 0;
      }
      
      .credentials-box h3 {
        color: #040013;
        font-size: 15px;
        font-weight: 700;
        margin-bottom: 16px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .credential-row {
        margin-bottom: 14px;
        font-size: 14px;
        color: #4A5568;
      }
      
      .credential-row strong {
        color: #040013;
        display: inline-block;
        width: 140px;
      }
      
      .pwd-badge {
        font-family: SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace;
        background-color: #F8F9FA;
        border: 1px solid #E2E8F0;
        padding: 4px 8px;
        font-size: 13px;
        font-weight: 700;
        color: #040013;
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
        <h2 class="title">Hello ${fullname},</h2>
        <p class="paragraph">An administrator has created a Concierge staff account for you on the Landlord2Landlord CMS dashboard. You can now access the admin panel to manage property listings, leads, and staff workflows using the credentials below:</p>
        
        <div class="credentials-box">
          <h3>Your Account Credentials</h3>
          <div class="credential-row">
            <strong>CMS Portal Link:</strong>
            <a href="${process.env.CMS_URL}/auth/login" style="color: #3185FC; text-decoration: none; font-weight: 600;">Go to Login Page</a>
          </div>
          <div class="credential-row">
            <strong>Email Address:</strong>
            <span>${email}</span>
          </div>
          <div class="credential-row">
            <strong>Temporary Password:</strong>
            <span class="pwd-badge">${password}</span>
          </div>
          <p style="margin-top: 16px; font-size: 12px; color: #718096; font-style: italic;">For security reasons, please change your temporary password immediately from the Settings screen after your first login.</p>
        </div>
        
        <a href="${process.env.CMS_URL}/auth/login" class="btn">Log In to CMS</a>
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