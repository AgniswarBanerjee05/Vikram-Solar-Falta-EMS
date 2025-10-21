# Email Confirmation Setup Guide

## Overview
The Falta EMS system now sends automatic email confirmations when admin accounts or user accounts are created. Users receive their login credentials and a link to access the dashboard.

## Features
✅ Automatic email on user account creation  
✅ Automatic email on admin account creation  
✅ Beautiful HTML email templates with credentials  
✅ Plain text fallback for email clients  
✅ Configurable SMTP settings  
✅ Support for Gmail, Office365, SendGrid, and custom SMTP  
✅ Graceful degradation (works without email configured)

---

## Quick Setup

### 1. Configure Email Settings

Copy the `.env.example` file to create your `.env` file:

```bash
cd backend
cp .env.example .env
```

Edit the `.env` file and add your email credentials:

```env
# Required for email functionality
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false

# Optional customization
EMAIL_FROM=noreply@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS
DASHBOARD_URL=https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/
```

### 2. Gmail Setup (Recommended for Testing)

1. **Enable 2-Factor Authentication**
   - Go to [Google Account Security](https://myaccount.google.com/security)
   - Enable 2-Step Verification

2. **Create App Password**
   - Visit [App Passwords](https://myaccount.google.com/apppasswords)
   - Select "Mail" and "Other (Custom name)"
   - Enter "Falta EMS" as the name
   - Click "Generate"
   - Copy the 16-character password

3. **Update .env File**
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop  # Your 16-char app password
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   ```

### 3. Restart Backend Server

```bash
cd backend/admin-server
npm run dev
```

---

## Alternative Email Providers

### Office 365 / Outlook
```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=apikey
EMAIL_PASSWORD=YOUR_SENDGRID_API_KEY
```

### Custom SMTP Server
```env
EMAIL_HOST=mail.your-domain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_SECURE=false  # true for port 465
EMAIL_USER=your-smtp-username
EMAIL_PASSWORD=your-smtp-password
```

---

## Testing Email Functionality

### Test 1: Create a User Account

1. Log in to the admin portal
2. Navigate to "Manage Users"
3. Click "Create New User"
4. Fill in the details:
   - Email: a valid email address you can check
   - Full Name: Test User
   - Password: (optional, auto-generated if left empty)
5. Click "Create User"
6. Check the email inbox for the confirmation email

### Test 2: Create an Admin Account

1. Use the admin registration endpoint
2. Provide valid credentials
3. Check email for admin confirmation

### What to Expect

The recipient will receive an email with:
- ✉️ Subject: "Your [User/Admin] Account Has Been Created"
- 🎨 Professionally designed HTML email
- 🔐 Login credentials (email + password)
- 🔗 Direct link to dashboard
- ⚠️ Security reminder to change password
- 📋 Next steps guide

---

## Troubleshooting

### Email Not Sending

**Check Console Output:**
```
Email transporter configured with smtp.gmail.com:587
Email sent to user@example.com: <message-id>
```

**If you see "EMAIL DISABLED":**
- Email credentials are not configured
- Check `EMAIL_USER` and `EMAIL_PASSWORD` in `.env`

**Gmail "Less Secure App" Error:**
- Don't use your regular password
- Must use an App Password (see Gmail setup above)
- Ensure 2-Factor Authentication is enabled

**SMTP Authentication Error:**
- Verify `EMAIL_USER` and `EMAIL_PASSWORD` are correct
- Check if your email provider requires app-specific passwords
- Ensure your firewall allows outbound connections on port 587

**Connection Timeout:**
- Check `EMAIL_HOST` and `EMAIL_PORT` are correct
- Try switching between port 587 (TLS) and 465 (SSL)
- Update `EMAIL_SECURE` accordingly

### Email Goes to Spam

- Add a valid `EMAIL_FROM` address
- Use a professional `EMAIL_FROM_NAME`
- Consider using a dedicated email service (SendGrid, Mailgun)
- Set up SPF/DKIM records for your domain

---

## Development Mode (Without Email)

If you don't want to configure email during development:

1. **Simply don't set email credentials** - the system will work normally
2. **Check server console** - credentials are logged when accounts are created
3. **Response includes credentials** - the API response contains the user's password

Console output when email is disabled:
```
Email credentials not configured. Emails will not be sent.
[EMAIL DISABLED] Would send to user@example.com: Your User Account Has Been Created
```

---

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit `.env` file** - it's in `.gitignore` for a reason
2. **Use App Passwords** - don't use your main email password
3. **Rotate credentials** - change email passwords periodically
4. **Limit permissions** - use dedicated email accounts for sending
5. **Monitor usage** - watch for unusual email sending activity
6. **HTTPS only** - ensure dashboard URL uses HTTPS in production

---

## Email Template Customization

The email templates are defined in `backend/shared/email.js`. You can customize:

- **Colors**: Change the gradient colors in the CSS
- **Logo**: Add your company logo in the header
- **Content**: Modify the message text
- **Footer**: Update company information
- **Styling**: Adjust fonts, spacing, and layout

Example customization:
```javascript
// In backend/shared/email.js
const header = {
  background: 'linear-gradient(135deg, #YOUR_COLOR_1 0%, #YOUR_COLOR_2 100%)',
  // ... other styles
};
```

---

## Support

If you encounter issues:

1. Check the backend server console for error messages
2. Verify all environment variables are set correctly
3. Test with Gmail first (easiest to set up)
4. Check your email provider's SMTP documentation
5. Ensure firewall allows outbound SMTP connections

For more help, check the main project README or contact the development team.

---

## What Happens When Email Fails?

The system is designed to be resilient:

✅ **Account creation still succeeds** - even if email fails  
✅ **Credentials returned in API response** - admin can manually share them  
✅ **Error logged to console** - for debugging  
✅ **User can still log in** - no functionality is blocked

This ensures the system remains functional even with email service outages.
