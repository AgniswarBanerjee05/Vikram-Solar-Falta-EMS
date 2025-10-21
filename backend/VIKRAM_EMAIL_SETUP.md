# Setup Guide for agniswar.banerjee@vikramsolar.com

## Quick Setup Steps

### Step 1: Identify Your Email Provider

Vikram Solar likely uses one of these:

#### Option A: Microsoft Office 365 / Outlook (Most Common)
- You access email via Outlook or outlook.office.com
- **Use these settings:**
  ```env
  EMAIL_HOST=smtp.office365.com
  EMAIL_PORT=587
  EMAIL_SECURE=false
  EMAIL_USER=agniswar.banerjee@vikramsolar.com
  EMAIL_PASSWORD=your-password
  ```

#### Option B: Google Workspace (Gmail for Business)
- You access email via Gmail interface or mail.google.com
- **Use these settings:**
  ```env
  EMAIL_HOST=smtp.gmail.com
  EMAIL_PORT=587
  EMAIL_SECURE=false
  EMAIL_USER=agniswar.banerjee@vikramsolar.com
  EMAIL_PASSWORD=your-app-password
  ```
  ⚠️ **Important:** If 2FA is enabled, you need an **App Password**:
  1. Go to your Google Account settings
  2. Security → 2-Step Verification → App passwords
  3. Generate a new app password for "Mail"
  4. Use that 16-character password (not your regular password)

#### Option C: Custom Mail Server
- Your IT department provided custom settings
- Contact IT for SMTP server details

### Step 2: Update .env File

Edit `backend/.env` and replace:
```env
EMAIL_PASSWORD=YOUR_VIKRAM_SOLAR_PASSWORD_HERE
```

With your actual password.

**The file should look like:**
```env
EMAIL_HOST=smtp.office365.com  # or smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=agniswar.banerjee@vikramsolar.com
EMAIL_PASSWORD=your-actual-password-here
EMAIL_FROM=agniswar.banerjee@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS
```

### Step 3: Test the Configuration

```bash
cd backend
node test-features.cjs
```

Look for:
- ✅ Email configuration found
- ✅ Email service can send emails

### Step 4: Restart Servers

**Terminal 1:**
```bash
cd backend/admin-server
npm run dev
```

**Terminal 2:**
```bash
cd backend/user-server
npm run dev
```

### Step 5: Test by Creating a User

1. Go to Admin portal
2. Create a new user with any email address
3. Check console for "Email sent to..."
4. Verify email arrives (including vikramsolar.com addresses)

## Troubleshooting

### Error: "535 Authentication Failed"

**Cause:** Wrong password or 2FA blocking

**Solutions:**
1. Double-check password (no extra spaces)
2. If using Office 365:
   - Your account may require Modern Authentication
   - Try enabling "Less secure app access" (not recommended) OR
   - Use OAuth2 (more complex setup)
3. If using Google Workspace:
   - Generate an App Password (see above)
   - Make sure 2FA is set up first

### Error: "Connection timeout"

**Cause:** Firewall or wrong SMTP server

**Solutions:**
1. Check if you're on company VPN
2. Try alternative ports: 465 (with EMAIL_SECURE=true) or 25
3. Verify SMTP server address with IT department

### Error: "550 Relay access denied"

**Cause:** SMTP server doesn't recognize your IP

**Solutions:**
1. Must be on company network/VPN
2. Contact IT to whitelist your IP address
3. Use VPN if working remotely

### Still Not Working?

**Get exact settings from Outlook/Gmail:**

**For Outlook:**
1. Open Outlook → File → Account Settings → Account Settings
2. Double-click your email account
3. Click "More Settings" → "Outgoing Server" tab
4. Note the settings there

**For Gmail:**
1. Settings → See all settings → Forwarding and POP/IMAP
2. Enable IMAP
3. Use standard Gmail SMTP settings

## Security Notes

⚠️ **Never commit your real password to Git!**

The `.env` file is in `.gitignore` so it won't be committed, but double-check:

```bash
git status
# Should NOT show backend/.env
```

## Why This Works Better

✅ **Sending from vikramsolar.com to vikramsolar.com**
- Same domain = trusted by mail server
- SPF/DKIM/DMARC checks will pass
- Won't be flagged as spam
- No external sender warnings

✅ **Proper Authentication**
- Using company credentials
- Server recognizes you as legitimate sender

✅ **Works for All Recipients**
- Internal (vikramsolar.com) ✅
- External (gmail.com, yahoo.com, etc.) ✅

## Next Steps

After setup works:
1. Test with multiple vikramsolar.com addresses
2. Check spam folders (first few emails might go there)
3. Ask recipients to mark as "Not Spam" if needed
4. After a few successful sends, emails will be trusted
