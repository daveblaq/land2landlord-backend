/**
 * Generate email payload with HTML content to confirm a user's mailing list subscription.
 * Sent back directly to the subscriber.
 * 
 * @param userEmail The subscriber's email address
 */
export const getMailingListWelcomeTemplate = (userEmail: string) => {
  return {
    header: 'Welcome to the Landlord2Landlord Mailing List!',
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mailing List Welcome</title>
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
      
      .welcome-badge {
        display: inline-block;
        background-color: rgba(49, 133, 252, 0.08);
        color: #3185FC;
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
      
      .highlight-box {
        background-color: #F7FAFC;
        border: 1px solid #E2E8F0;
        border-left: 4px solid #3185FC;
        padding: 24px;
        margin: 32px 0;
      }
      
      .highlight-box h3 {
        color: #040013;
        font-size: 14px;
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
      
      .footer a {
        color: #3185FC;
        text-decoration: none;
      }
    </style>
  </head>
  <body>
    <div class="email-wrapper">
      <div class="header">
        <img class="logo-img" src="https://res.cloudinary.com/dd1damszz/image/upload/v1782435869/logo_rd2i4q.svg" alt="Landlord2Landlord" />
      </div>
      
      <div class="content">
        <div class="welcome-badge">Subscription Confirmed</div>
        <h2 class="title">Hello,</h2>
        <p class="paragraph">Thank you for subscribing to the Landlord2Landlord mailing list! You are now set to receive priority updates from us.</p>
        
        <div class="highlight-box">
          <h3>What you will receive</h3>
          <p>• Off-market property listings and investment deals</p>
          <p>• Premium HMO and property portfolio updates</p>
          <p>• Industry news, landlord tools, and updates</p>
        </div>
        
        <p class="paragraph">We will keep you updated when new opportunities arise. If you have any questions or want to speak with our concierge team, feel free to reply directly to this email or visit our website.</p>
        
        <a href="${process.env.WEBSITE_URL || 'https://landlord2-landlord.vercel.app'}" class="btn" target="_blank">Explore Properties</a>
      </div>
      
      <div class="footer">
        <p>This is an automated subscription receipt sent to ${userEmail}.</p>
        <p>To unsubscribe, please contact our support team.</p>
        <p>&copy; 2026 Landlord2Landlord. All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
  };
};
