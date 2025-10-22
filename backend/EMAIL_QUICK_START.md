# 🚀 Email Service - Quick Start Guide

Get email notifications working in **5 minutes** using Resend API.

---

## ⚡ **Super Quick Setup**

### **1. Get API Key (2 minutes)**

1. Visit: **https://resend.com/signup**
2. Sign up (email or GitHub)
3. Go to: **https://resend.com/api-keys**
4. Click **"Create API Key"**
5. Copy the key (starts with `re_`)

### **2. Add to Your Project (1 minute)**

Open `.env` file:
```
backend/.env
```

Add this line:
```env
RESEND_API_KEY=re_paste_your_key_here
```

**Example:**
```env
RESEND_API_KEY=re_abc123xyz789
EMAIL_FROM=noreply@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS
```

### **3. Install Package (1 minute)**

```powershell
cd backend/shared
npm install resend
```

### **4. Restart Servers (1 minute)**

Stop current servers (Ctrl+C), then:

```powershell
# Terminal 1 - Admin Server
cd backend/admin-server
npm start

# Terminal 2 - User Server  
cd backend/user-server
npm start
```

Look for:
```
✅ Email service configured: Resend API
```

---

## 🧪 **Test It**

1. Open admin portal
2. Create a new user account
3. Enter a real email address (yours)
4. Check your inbox for welcome email!

---

## 📧 **What You Get**

When you create an account, the user receives:
- ✅ Professional welcome email
- ✅ Login credentials (username + auto-generated password)
- ✅ Link to dashboard
- ✅ Instructions to change password

**Works for:**
- User account creation
- Admin account creation
- Any email address (including @vikramsolar.com)

---

## ❓ **Troubleshooting**

**No email configured message?**
- Check API key in `.env` file
- Restart servers

**Email not received?**
- Check spam folder
- Verify at: https://resend.com/emails

**Rate limit error?**
- Free tier: 100 emails/day
- Check usage at: https://resend.com/overview

---

## 📚 **Full Documentation**

For detailed setup, domain verification, and advanced features:
- See `RESEND_EMAIL_SETUP.md`

---

## 💰 **Cost**

**Free tier (no credit card):**
- 100 emails per day
- 3,000 emails per month
- Perfect for this system!

---

## ✅ **Done!**

Your email service is now active. Every new account will automatically receive:
- Welcome email with credentials
- Professional branded template
- Reliable delivery to any email address

**Questions?** Check `RESEND_EMAIL_SETUP.md` for detailed troubleshooting.
