export const getWelcomeEmailTemplate = (firstName: string) => {
  return {
    header: 'Welcome! Your account is ready.',
    body: `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        line-height: 1.6;
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        margin: 0;
        padding: 20px;
        min-height: 100vh;
      }
      
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background: #ffffff;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border-radius: 12px;
      }
      
      .header {
        background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
        color: #ffffff;
        padding: 30px 20px;
        text-align: center;
        position: relative;
      }
      
      .header h1 {
        font-size: 24px;
        font-weight: 700;
        margin-bottom: 8px;
      }
      
      .header p {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .content {
        padding: 30px 20px;
        background: #ffffff;
      }
      
      .welcome-message {
        text-align: center;
        margin-bottom: 25px;
      }
      
      .welcome-message h2 {
        color: #1f2937;
        font-size: 20px;
        font-weight: 600;
        margin-bottom: 12px;
      }
      
      .welcome-message p {
        color: #4b5563;
        font-size: 14px;
        margin-bottom: 15px;
      }
      
      .account-info {
        background: #f3f4f6;
        border-left: 4px solid #6366f1;
        padding: 15px;
        margin: 25px 0;
        text-align: left;
        border-radius: 0 8px 8px 0;
      }
      
      .account-info h3 {
        color: #111827;
        font-size: 16px;
        margin-bottom: 8px;
      }
      
      .account-info p {
        color: #374151;
        font-size: 13px;
        margin-bottom: 4px;
      }
      
      .footer {
        background: #1f2937;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      
      .footer p {
        color: #9ca3af;
        font-size: 11px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>🎉 Welcome!</h1>
        <p>We're glad to have you with us.</p>
      </div>
      
      <div class="content">
        <div class="welcome-message">
          <h2>Hello ${firstName}!</h2>
          <p>Your account has been successfully created. You now have full access to our platform and features.</p>
        </div>
        
        <div class="account-info">
          <h3>✅ Account Details</h3>
          <p>• Your email has been verified</p>
          <p>• Your security settings are active</p>
          <p>• You can start exploring immediately</p>
        </div>
      </div>
      
      <div class="footer">
        <p>This is an automated message, please do not reply directly to this email.</p>
        <p style="margin-top: 10px;">&copy; 2025 All rights reserved.</p>
      </div>
    </div>
  </body>
</html>`,
  };
};