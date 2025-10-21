const nodemailer = require('nodemailer');

/**
 * Create email transporter based on environment configuration
 * Supports Gmail, custom SMTP, and test accounts for development
 */
function createTransporter() {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASSWORD;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = process.env.EMAIL_PORT || 587;
  const emailSecure = process.env.EMAIL_SECURE === 'true';

  // If no credentials provided, log warning and return null
  if (!emailUser || !emailPass) {
    console.warn('Email credentials not configured. Emails will not be sent.');
    console.warn('Set EMAIL_USER and EMAIL_PASSWORD environment variables to enable email functionality.');
    return null;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: emailHost,
      port: parseInt(emailPort, 10),
      secure: emailSecure, // true for 465, false for other ports
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });

    console.log(`Email transporter configured with ${emailHost}:${emailPort}`);
    return transporter;
  } catch (error) {
    console.error('Failed to create email transporter:', error);
    return null;
  }
}

// Initialize transporter once
const transporter = createTransporter();

/**
 * Send email with HTML template
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text fallback
 * @returns {Promise<Object|null>} - Send result or null if email disabled
 */
async function sendEmail({ to, subject, html, text }) {
  if (!transporter) {
    console.log(`[EMAIL DISABLED] Would send to ${to}: ${subject}`);
    return null;
  }

  const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
  const fromName = process.env.EMAIL_FROM_NAME || 'Vikram Solar - Falta EMS';

  try {
    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Failed to send email to ${to}:`, error);
    throw error;
  }
}

/**
 * Send account creation confirmation email to a new user
 * @param {Object} params
 * @param {string} params.email - User's email address
 * @param {string} params.fullName - User's full name
 * @param {string} params.password - Temporary password
 * @param {boolean} params.isAdmin - Whether this is an admin account
 * @returns {Promise<Object|null>}
 */
async function sendUserCreationEmail({ email, fullName, password, isAdmin = false }) {
  const accountType = isAdmin ? 'Admin' : 'User';
  const dashboardUrl = process.env.DASHBOARD_URL || 'https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/';
  
  const subject = `Your ${accountType} Account Has Been Created - Vikram Solar Falta EMS`;
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #334155;
          background-color: #f8fafc;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }
        .header p {
          margin: 8px 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .greeting {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 20px;
        }
        .message {
          font-size: 15px;
          color: #475569;
          margin-bottom: 25px;
        }
        .credentials-box {
          background: #f1f5f9;
          border-left: 4px solid #0ea5e9;
          padding: 20px;
          border-radius: 8px;
          margin: 25px 0;
        }
        .credentials-box h3 {
          margin: 0 0 15px;
          font-size: 16px;
          color: #1e293b;
        }
        .credential-item {
          margin: 10px 0;
          font-size: 14px;
        }
        .credential-label {
          font-weight: 600;
          color: #64748b;
          display: inline-block;
          width: 120px;
        }
        .credential-value {
          font-family: 'Courier New', monospace;
          background: #ffffff;
          padding: 4px 8px;
          border-radius: 4px;
          color: #0f172a;
          font-weight: 500;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%);
          color: white;
          padding: 14px 32px;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          font-size: 15px;
          margin: 20px 0;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }
        .warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          font-size: 14px;
          color: #92400e;
        }
        .footer {
          background: #f8fafc;
          padding: 20px;
          text-align: center;
          font-size: 13px;
          color: #64748b;
          border-top: 1px solid #e2e8f0;
        }
        .footer p {
          margin: 5px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 Vikram Solar - Falta EMS</h1>
          <p>Energy Meter Dashboard</p>
        </div>
        
        <div class="content">
          <div class="greeting">
            Hello ${fullName || email}! 👋
          </div>
          
          <div class="message">
            Welcome to the Vikram Solar Falta Energy Meter Dashboard. Your <strong>${accountType}</strong> account has been successfully created.
          </div>
          
          <div class="credentials-box">
            <h3>🔐 Your Login Credentials</h3>
            <div class="credential-item">
              <span class="credential-label">Email:</span>
              <span class="credential-value">${email}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Password:</span>
              <span class="credential-value">${password}</span>
            </div>
            <div class="credential-item">
              <span class="credential-label">Account Type:</span>
              <span class="credential-value">${accountType}</span>
            </div>
          </div>
          
          <div class="warning">
            ⚠️ <strong>Important:</strong> This is a temporary password. Please change it after your first login for security reasons.
          </div>
          
          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">Access Dashboard</a>
          </div>
          
          <div class="message" style="margin-top: 30px; font-size: 14px;">
            <strong>What's next?</strong>
            <ul style="margin: 10px 0; padding-left: 20px;">
              <li>Click the button above to access the dashboard</li>
              <li>Log in using the credentials provided</li>
              <li>Change your password in your profile settings</li>
              ${isAdmin ? '<li>Start managing users and monitoring the system</li>' : '<li>Explore the energy meter data and analytics</li>'}
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Vikram Solar - Falta EMS</strong></p>
          <p>Live insights, predictive-ready architecture</p>
          <p style="margin-top: 15px; font-size: 12px;">
            If you have any questions or didn't request this account, please contact your administrator.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Hello ${fullName || email}!

Welcome to the Vikram Solar Falta Energy Meter Dashboard. Your ${accountType} account has been successfully created.

Your Login Credentials:
- Email: ${email}
- Password: ${password}
- Account Type: ${accountType}

⚠️ IMPORTANT: This is a temporary password. Please change it after your first login for security reasons.

Access the dashboard at: ${dashboardUrl}

What's next?
1. Click the link above to access the dashboard
2. Log in using the credentials provided
3. Change your password in your profile settings
${isAdmin ? '4. Start managing users and monitoring the system' : '4. Explore the energy meter data and analytics'}

If you have any questions or didn't request this account, please contact your administrator.

---
Vikram Solar - Falta EMS
Live insights, predictive-ready architecture
  `;

  return sendEmail({ to: email, subject, html, text });
}

/**
 * Send admin account creation confirmation email
 * @param {Object} params
 * @param {string} params.email - Admin's email address
 * @param {string} params.fullName - Admin's full name
 * @param {string} params.password - Password used during registration
 * @returns {Promise<Object|null>}
 */
async function sendAdminCreationEmail({ email, fullName, password }) {
  return sendUserCreationEmail({ email, fullName, password, isAdmin: true });
}

module.exports = {
  sendEmail,
  sendUserCreationEmail,
  sendAdminCreationEmail
};
