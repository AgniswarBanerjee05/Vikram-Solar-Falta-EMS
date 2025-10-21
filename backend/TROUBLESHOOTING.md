# 🔧 Quick Fix Guide - Password Display & Email Issues

## ✅ What We Fixed

### 1. Database Schema
- Added `plain_password` column to users table
- Column is now present and working ✅

### 2. Password Storage
- Backend correctly stores plain passwords ✅
- Admin portal can display passwords ✅

### 3. Email System
- Email code is implemented and working ✅
- **Needs configuration to send actual emails** ⚠️

---

## 🚀 How to Enable Email Notifications

### Option 1: Gmail (Recommended - 5 Minutes)

**Step 1: Get App Password**
1. Go to https://myaccount.google.com/security
2. Enable "2-Step Verification" if not already enabled
3. Go to https://myaccount.google.com/apppasswords
4. Select "Mail" and "Other (Custom name)"
5. Type "Falta EMS"
6. Click "Generate"
7. **Copy the 16-character password** (e.g., `abcd efgh ijkl mnop`)

**Step 2: Update .env File**

Open `backend/.env` and uncomment/add these lines:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM_NAME=Vikram Solar - Falta EMS
```

Replace `your-gmail@gmail.com` with your Gmail address and paste the app password.

**Step 3: Restart Backend**
```bash
cd backend/admin-server
npm run dev
```

**Step 4: Test**
- Create a new user in admin portal
- Check the email inbox!

---

### Option 2: No Email (Development Mode)

If you don't want to configure email right now:

**What happens:**
- ✅ Accounts are created normally
- ✅ Passwords displayed in console logs
- ✅ Passwords visible in admin portal
- ✅ All features work except email sending

**No action needed!** The system works fine without email.

---

## 📊 Verifying Everything Works

### Check 1: Password Display in Admin Portal

1. Start the backend servers:
   ```bash
   # Terminal 1
   cd backend/admin-server
   npm run dev

   # Terminal 2
   cd backend/user-server
   npm run dev
   ```

2. Open admin portal
3. Log in as admin
4. Go to "Manage Users"
5. Create a new user
6. **Look for the "Password" column** - it should show the password

### Check 2: Password Copy Function

1. In the user table, find the password column
2. Click the "Copy" button next to any password
3. Paste somewhere - password should be copied!

### Check 3: User Password Change

1. Log out of admin
2. Log in as a regular user
3. Look for "Change Password" button in topbar (🔒 icon)
4. Click it and change your password
5. Log back in as admin
6. Check the user table - password should be updated!

### Check 4: Email Sending

1. Configure email in `.env` (see above)
2. Restart admin server
3. Create a new user
4. Check console for: `Email sent to user@example.com: <message-id>`
5. Check email inbox for confirmation email

---

## 🐛 Troubleshooting

### "Password column is empty in admin portal"

**Solution:**
```bash
cd backend
node test-features.cjs
```

This will verify the database schema and show if passwords are being stored.

If passwords are being stored but not displayed, check:
- Browser console for errors
- Network tab - check `/api/users` response includes `plain_password`

### "Email not sending"

**Check console output when creating user:**

```
✅ Good: "Email sent to user@example.com: <message-id>"
⚠️ No config: "[EMAIL DISABLED] Would send to..."
❌ Error: "Failed to send email: [error message]"
```

**Common fixes:**
- Gmail: Must use App Password, not regular password
- Port: Try 465 with `EMAIL_SECURE=true` if 587 fails
- Firewall: Allow outbound connections on port 587/465

### "User can't see Change Password button"

Make sure:
- User is logged in (not admin)
- Using the user dashboard, not admin panel
- Button appears next to "Download CSV" with 🔒 icon

---

## 📝 Complete Configuration Example

Here's a working `.env` file for Gmail:

```env
# Backend Ports
ADMIN_SERVER_PORT=4000
USER_SERVER_PORT=5000

# Security
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=noreply@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS

# Dashboard URL
DASHBOARD_URL=https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/
```

---

## ✅ Quick Test Commands

```bash
# Test if database has plain_password column
cd backend
node test-features.cjs

# Check current database schema
node -e "const {getDb}=require('./shared/database');console.log(getDb().prepare('PRAGMA table_info(users)').all().map(c=>c.name));"

# Test email module
node -e "require('dotenv').config();const {sendUserCreationEmail}=require('./shared/email');sendUserCreationEmail({email:'test@example.com',fullName:'Test',password:'Pass123',isAdmin:false}).then(()=>console.log('Done')).catch(e=>console.log(e.message));"
```

---

## 🎯 Summary

**Password Display:**
- ✅ Database has `plain_password` column
- ✅ Backend stores passwords
- ✅ Admin portal displays passwords
- ✅ Copy button works

**Email Sending:**
- ✅ Email code is implemented
- ⚠️ **Needs EMAIL_USER and EMAIL_PASSWORD in .env**
- ✅ Works in "disabled" mode without config
- ✅ Full instructions in `QUICKSTART_EMAIL.md`

**User Password Change:**
- ✅ Button in user dashboard
- ✅ Modal with validation
- ✅ Updates backend
- ✅ Admin can see new password

---

## 📞 Need Help?

1. Run `node test-features.cjs` to diagnose issues
2. Check `EMAIL_SETUP.md` for detailed email setup
3. See console logs when creating users
4. Check browser console for frontend errors

Everything should work now! 🎉
