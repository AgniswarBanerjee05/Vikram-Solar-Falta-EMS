# 🚀 Quick Start: Email Confirmation Setup

**Get email confirmations working in 5 minutes!**

---

## Step 1: Install Dependencies ✅

Email package is already installed! If needed:
```bash
cd backend/shared
npm install
```

---

## Step 2: Create .env File

```bash
cd backend
cp .env.example .env
```

---

## Step 3: Configure Gmail (Easiest Option)

### Get Gmail App Password

1. **Enable 2-Factor Authentication**
   - Visit: https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Create App Password**
   - Visit: https://myaccount.google.com/apppasswords
   - Select "Mail" → "Other (Custom name)"
   - Enter "Falta EMS"
   - Click "Generate"
   - **Copy the 16-character password**

3. **Update .env File**
   ```env
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASSWORD=abcd efgh ijkl mnop
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_SECURE=false
   EMAIL_FROM_NAME=Vikram Solar - Falta EMS
   DASHBOARD_URL=https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/
   ```

---

## Step 4: Restart Backend

```bash
cd backend/admin-server
npm run dev
```

**Look for this in the console:**
```
Email transporter configured with smtp.gmail.com:587
Admin server running on port 4000
```

---

## Step 5: Test It!

1. **Open admin portal** in your browser
2. **Log in** as admin
3. **Create a new user**
   - Go to "Manage Users"
   - Click "Create New User"
   - Enter a real email address you can check
   - Click "Create"

4. **Check the email inbox!** 📧

---

## ✅ Success Indicators

### Console Shows:
```
Email sent to user@example.com: <message-id>
```

### User Receives Email With:
- ✉️ Subject: "Your User Account Has Been Created"
- 🔐 Login credentials (email + password)
- 🔗 Link to dashboard
- ⚠️ Reminder to change password

---

## 🚨 Troubleshooting

### "Email credentials not configured"
→ Check EMAIL_USER and EMAIL_PASSWORD in .env

### "Invalid login"
→ Use App Password, not your regular Gmail password

### "Connection timeout"
→ Check firewall allows port 587

### Still not working?
→ See detailed guide: `backend/EMAIL_SETUP.md`

---

## 🎉 That's It!

Your email confirmation system is now live. Every time you create a user or admin account, they'll receive a professional welcome email with their credentials!

---

## 📝 Optional: Without Email

Don't want to set up email right now? **No problem!**

Just skip the EMAIL_ configuration. The system will:
- ✅ Still create accounts normally
- ✅ Log credentials to console
- ✅ Return credentials in API response
- ✅ Work perfectly without email

Simply look for this in the console:
```
[EMAIL DISABLED] Would send to user@example.com: Your User Account Has Been Created
```

---

## 📚 More Info

- 📖 **Full Setup Guide:** `EMAIL_SETUP.md`
- 🎨 **Email Preview:** `email-preview.html`
- ⚙️ **All Config Options:** `.env.example`
- 📋 **Implementation Details:** `EMAIL_IMPLEMENTATION_SUMMARY.md`
