# 📧 Resend Email API Setup Guide

Complete guide to set up email notifications using Resend API for the Falta EMS system.

---

## 🎯 **Why Use Resend API?**

**Problems with SMTP:**
- ❌ Gmail/Outlook SMTP often blocks emails to corporate domains
- ❌ Emails go to spam or get rejected
- ❌ Less reliable for automated system emails
- ❌ Requires app passwords and security compromises

**Benefits of Resend API:**
- ✅ **99.9% deliverability** - Professional email infrastructure
- ✅ **Works with any email address** including @vikramsolar.com
- ✅ **No SMTP issues** - Modern REST API
- ✅ **Free tier: 100 emails/day, 3,000/month** (more than enough for this system)
- ✅ **Easy setup** - Just need an API key
- ✅ **Detailed analytics** - Track delivery, opens, clicks

---

## 🚀 **Quick Setup (5 Minutes)**

### **Step 1: Sign Up for Resend**

1. Go to **https://resend.com**
2. Click **"Start Building"** or **"Sign Up"**
3. Sign up with:
   - Your email (can use dragniswarbanerjee@gmail.com)
   - Or GitHub/Google authentication
4. Verify your email

### **Step 2: Get Your API Key**

1. After login, go to **https://resend.com/api-keys**
2. Click **"Create API Key"**
3. Configure:
   - **Name:** `Falta EMS Production` (or any name)
   - **Permission:** `Sending access` (default)
   - **Domain:** Leave as `All Domains` or select specific one
4. Click **"Create"**
5. **Copy the API key** (it starts with `re_`)
   - ⚠️ **Important:** Save it now! You can't see it again.

**Example API key format:**
```
re_123456789abcdefghijklmnopqrstuvwxyz
```

### **Step 3: Add API Key to Your Project**

Open your `.env` file at:
```
C:\Users\agniswar.b\Downloads\falta_ems_prototype\backend\.env
```

Add/update this line:
```env
RESEND_API_KEY=re_YOUR_ACTUAL_API_KEY_HERE
```

**Full configuration:**
```env
# ================================================
# Email Configuration - Resend API (Recommended)
# ================================================
RESEND_API_KEY=re_123456789abcdefghijklmnopqrstuvwxyz

# Sender Information
EMAIL_FROM=noreply@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS

# Dashboard URL
DASHBOARD_URL=https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/
```

### **Step 4: Verify Domain (Optional - For Production)**

For production use with vikramsolar.com emails:

1. Go to **https://resend.com/domains**
2. Click **"Add Domain"**
3. Enter: `vikramsolar.com`
4. Add the DNS records shown to your domain's DNS settings:
   - **SPF Record** (TXT)
   - **DKIM Record** (TXT)
   - **MX Record**
5. Wait for verification (usually 15-30 minutes)

**Note:** For testing, you can skip this and use the default domain. Emails will come from `noreply@resend.dev` instead.

### **Step 5: Restart Servers**

```powershell
# Stop all running servers (Ctrl+C in terminals)

# Start admin server
cd backend/admin-server
npm start

# In another terminal, start user server
cd backend/user-server
npm start
```

You should see:
```
✅ Email service configured: Resend API
Admin server running on port 4000
```

---

## 🧪 **Testing Email Functionality**

### **Test 1: Create a New User Account**

1. Open admin portal: http://localhost:5173/?view=admin
2. Login with admin credentials
3. Click **"Create Account"**
4. Fill in details:
   - **Email:** Use a real email you can check (your personal email)
   - **Full Name:** Test User
   - **Password:** Leave empty (system generates one)
5. Click **"Create User"**

**Expected Result:**
- ✅ User created successfully
- ✅ Email sent to the user with credentials
- ✅ Console shows: `✅ Email sent via Resend to test@example.com: <message-id>`

### **Test 2: Check the Email**

1. Check the inbox of the email you used
2. You should receive:
   - **Subject:** "Your User Account Has Been Created - Vikram Solar Falta EMS"
   - **From:** "Vikram Solar - Falta EMS <noreply@vikramsolar.com>"
   - **Content:** Welcome message with login credentials

**Email includes:**
- Username (email)
- Auto-generated password
- Link to dashboard
- Instructions to change password

### **Test 3: Verify in Resend Dashboard**

1. Go to **https://resend.com/emails**
2. You should see your sent email with:
   - ✅ Delivery status
   - ✅ Recipient
   - ✅ Timestamp
   - ✅ Subject

---

## 📋 **When Emails Are Sent**

The system automatically sends emails when:

1. **Admin Account Created** (`POST /api/admin/register`)
   - Subject: "Your Admin Account Has Been Created"
   - Recipient: New admin's email
   - Contains: Email and password

2. **User Account Created** (`POST /api/users`)
   - Subject: "Your User Account Has Been Created"
   - Recipient: New user's email
   - Contains: Email and auto-generated password

3. **Both scenarios include:**
   - Login credentials (username/password)
   - Link to dashboard
   - Instructions to change password
   - Welcome message

---

## 🎨 **Email Template Features**

The emails include:
- ✅ Professional HTML design
- ✅ Responsive layout (works on mobile)
- ✅ Vikram Solar branding
- ✅ Color-coded account types (Admin/User)
- ✅ Security warnings
- ✅ Plain text fallback
- ✅ Clickable dashboard button

---

## 🔧 **Troubleshooting**

### **Problem: "Email service not configured" message**

**Solution:**
- Check if `RESEND_API_KEY` is in `.env` file
- Verify the API key starts with `re_`
- Restart the servers after adding the key

### **Problem: "Failed to send email" error**

**Check:**
1. API key is valid (check at https://resend.com/api-keys)
2. API key has "Sending access" permission
3. You haven't exceeded free tier limits (100/day)

**View error details:**
```powershell
# Check server console output for full error message
```

### **Problem: Email goes to spam**

**Solutions:**
1. **For testing:** Check spam folder first
2. **For production:**
   - Verify your domain at https://resend.com/domains
   - Add SPF, DKIM, MX records to DNS
   - Use a custom domain email as sender

### **Problem: "Invalid API key" error**

**Solution:**
- API key might have been deleted or expired
- Create a new API key at https://resend.com/api-keys
- Update `.env` file with new key
- Restart servers

### **Problem: Rate limit exceeded**

**Free tier limits:**
- 100 emails per day
- 3,000 emails per month

**Solutions:**
1. Upgrade to paid plan ($20/month for 50k emails)
2. Use multiple API keys for different servers
3. Implement email queuing

---

## 💰 **Pricing**

### **Free Tier (Recommended for Development)**
- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ All features included
- ✅ No credit card required

**Sufficient for:**
- Testing and development
- Small teams (< 100 users)
- ~3 new accounts per day

### **Paid Plans (For Production)**

**Pro Plan - $20/month:**
- 50,000 emails/month
- 2,500 emails/day
- Email analytics
- Priority support

**Enterprise - Custom Pricing:**
- Unlimited emails
- Dedicated IP
- Custom SLA
- White-glove support

---

## 🔐 **Security Best Practices**

### **1. Protect Your API Key**

```env
# ✅ GOOD - In .env file (not committed to git)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# ❌ BAD - Never hardcode in source files
const apiKey = "re_xxxxxxxxxxxxx"; // DON'T DO THIS
```

### **2. Add .env to .gitignore**

```gitignore
# .gitignore
.env
.env.local
.env.production
```

### **3. Use Different Keys for Environments**

```env
# Development
RESEND_API_KEY=re_dev_xxxxxxxxxxxxx

# Production
RESEND_API_KEY=re_prod_xxxxxxxxxxxxx
```

### **4. Rotate Keys Regularly**

- Create new API key every 3-6 months
- Delete old keys after migration
- Keep track in password manager

---

## 🚀 **Production Deployment**

### **For Render.com (Recommended)**

1. In Render dashboard, go to your service
2. Click **"Environment"** tab
3. Add environment variable:
   - **Key:** `RESEND_API_KEY`
   - **Value:** Your API key
4. Click **"Save Changes"**
5. Service will auto-restart

### **For Other Platforms**

**Vercel:**
```bash
vercel env add RESEND_API_KEY
```

**Railway:**
- Settings → Variables → Add Variable

**Heroku:**
```bash
heroku config:set RESEND_API_KEY=re_xxxxx
```

**Docker:**
```bash
docker run -e RESEND_API_KEY=re_xxxxx ...
```

---

## 📊 **Monitoring & Analytics**

### **View Email Logs**

1. Go to **https://resend.com/emails**
2. See all sent emails with:
   - Delivery status
   - Opens (if enabled)
   - Clicks (if enabled)
   - Bounces
   - Complaints

### **Set Up Webhooks (Advanced)**

Receive real-time notifications:

1. Go to **https://resend.com/webhooks**
2. Add webhook URL: `https://your-domain.com/webhooks/email`
3. Select events:
   - `email.sent`
   - `email.delivered`
   - `email.bounced`

---

## 🆚 **Resend vs SMTP Comparison**

| Feature | Resend API | SMTP |
|---------|-----------|------|
| **Setup Complexity** | Easy (1 API key) | Complex (host, port, auth) |
| **Deliverability** | 99.9% | Variable (often poor) |
| **Corporate Email Support** | ✅ Excellent | ❌ Often blocked |
| **Spam Score** | ✅ Low (professional) | ⚠️ High (from Gmail) |
| **Rate Limits** | 100/day (free) | Varies by provider |
| **Error Handling** | Detailed API errors | Cryptic SMTP codes |
| **Analytics** | ✅ Full dashboard | ❌ None |
| **Cost** | Free / $20/month | Usually free |
| **Reliability** | ✅✅✅ Very high | ⚠️ Medium |

---

## 🎓 **Additional Resources**

- **Resend Docs:** https://resend.com/docs
- **API Reference:** https://resend.com/docs/api-reference
- **Node.js Guide:** https://resend.com/docs/send-with-nodejs
- **Status Page:** https://resend.com/status
- **Support:** support@resend.com

---

## ✅ **Quick Checklist**

Before going live, verify:

- [ ] Resend account created
- [ ] API key generated and saved
- [ ] API key added to `.env` file
- [ ] `.env` file in `.gitignore`
- [ ] Servers restarted with new config
- [ ] Test email sent successfully
- [ ] Email received (not in spam)
- [ ] Email template looks professional
- [ ] Domain verified (for production)
- [ ] Environment variables set on hosting platform

---

## 🎉 **Success!**

You now have a reliable, professional email service that:
- ✅ Sends automated welcome emails
- ✅ Delivers to any email address (including @vikramsolar.com)
- ✅ Looks professional with custom branding
- ✅ Includes all necessary information (username/password)
- ✅ Tracks delivery and engagement

**Next Steps:**
1. Test with a real vikramsolar.com email address
2. Verify the email is delivered (not spam)
3. Show to stakeholders for approval
4. Deploy to production with verified domain

---

**Need help?** Check the troubleshooting section or contact Resend support!
