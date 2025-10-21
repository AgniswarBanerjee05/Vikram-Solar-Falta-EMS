# Corporate Email Delivery Guide

## Problem: Emails reach Gmail but not vikramsolar.com addresses

### Why This Happens

Corporate email servers have stricter security than consumer email:

1. **SPF/DKIM/DMARC Validation** - They verify sender authenticity
2. **External Sender Policies** - Block emails from personal accounts about company business
3. **Aggressive Spam Filters** - Flag emails with company name from non-company domains
4. **Email Gateway Rules** - IT departments often block external SMTP for security

### Solution 1: Use Vikram Solar SMTP Server (RECOMMENDED)

#### Step 1: Get SMTP Settings from IT Department

Ask your IT department for:
- SMTP server address (e.g., `smtp.vikramsolar.com` or `mail.vikramsolar.com`)
- SMTP port (usually 587, 465, or 25)
- Whether SSL/TLS is required
- A service account email (e.g., `ems-noreply@vikramsolar.com`)
- Password for the service account

#### Step 2: Update .env File

```env
# Vikram Solar SMTP Configuration
EMAIL_HOST=smtp.vikramsolar.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=ems-noreply@vikramsolar.com
EMAIL_PASSWORD=your-password-from-IT

EMAIL_FROM=ems-noreply@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS
```

#### Step 3: Restart Servers

```bash
cd backend/admin-server
npm run dev
```

```bash
cd backend/user-server
npm run dev
```

### Solution 2: Whitelist Gmail Sender (Temporary)

Contact your IT department and request:

1. **Whitelist** `dragniswarbanerjee@gmail.com` in the spam filter
2. **Add transport rule** to allow emails from this address
3. **Disable external sender warnings** for this specific sender

**Note:** This is less secure and may not be approved by IT.

### Solution 3: Dual Configuration (Advanced)

For testing, you can check the recipient domain and use different SMTP servers:

**Modify `backend/shared/email.js`:**

```javascript
function getTransporter(recipientEmail) {
  const isVikramSolar = recipientEmail.endsWith('@vikramsolar.com');
  
  if (isVikramSolar) {
    // Use company SMTP for internal emails
    return nodemailer.createTransport({
      host: process.env.VIKRAM_SMTP_HOST,
      port: parseInt(process.env.VIKRAM_SMTP_PORT || '587'),
      secure: process.env.VIKRAM_SMTP_SECURE === 'true',
      auth: {
        user: process.env.VIKRAM_SMTP_USER,
        pass: process.env.VIKRAM_SMTP_PASSWORD
      }
    });
  } else {
    // Use Gmail for external emails
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
}
```

### Troubleshooting

#### Check Email Headers (Gmail)

1. Open a successfully received email in Gmail
2. Click the three dots → Show original
3. Check these headers:
   - `SPF`: Should be `PASS`
   - `DKIM`: Should be `PASS`
   - `DMARC`: Should be `PASS`

#### Common IT Department Questions

**Q: What email service are you trying to configure?**
A: A Node.js application needs to send account creation notifications to employees.

**Q: Why not use Microsoft 365/Outlook?**
A: If Vikram Solar uses Office 365, you can use these settings:

```env
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your.email@vikramsolar.com
EMAIL_PASSWORD=your-password
```

**Q: Can we use app-specific passwords?**
A: Yes! If you have 2FA enabled on your vikramsolar.com account:
1. Generate an app-specific password
2. Use it instead of your regular password

#### Test Email Delivery

Run this command to test:

```bash
cd backend
node test-features.cjs
```

Look for:
- ✅ Email configuration found
- ✅ Email sent successfully

#### Check Server Logs

When creating a user, watch for:
```
Email sent to user@vikramsolar.com
```

If you see errors like:
- `535 Authentication failed` - Wrong credentials
- `550 Relay access denied` - Need to use company SMTP
- `Connection timeout` - Firewall blocking outbound SMTP

### Quick Fix for Testing

**Use Gmail aliases for testing:**

If you need to test immediately, use Gmail addresses with `+` aliases:
- `dragniswarbanerjee+test1@gmail.com`
- `dragniswarbanerjee+test2@gmail.com`

These all deliver to the same Gmail inbox but appear as different addresses.

### Security Best Practices

1. **Never commit real passwords** to Git
2. **Use service accounts** (not personal email) for production
3. **Enable TLS/SSL** when possible (port 587 or 465)
4. **Rotate passwords** every 90 days
5. **Use OAuth2** if supported by your SMTP server

### Need More Help?

1. Check `backend/TROUBLESHOOTING.md` for common issues
2. Run `node test-features.cjs` to diagnose configuration
3. Contact IT department with this document for SMTP settings
