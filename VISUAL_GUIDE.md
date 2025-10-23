# 🎯 Visual Deployment Guide

## Your Application Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                       │
│                         🌐 INTERNET                                   │
│                                                                       │
└───────────────────────────┬───────────────────────────────────────────┘
                            │
                            │ HTTPS
                            │
        ┌───────────────────┼────────────────────┐
        │                   │                    │
        ▼                   ▼                    ▼
   ┌─────────┐      ┌──────────────┐    ┌──────────────┐
   │ GitHub  │      │   Render     │    │   Render     │
   │  Pages  │      │   (Admin)    │    │   (User)     │
   │         │      │              │    │              │
   │  React  │──────│ Express API  │    │ Express API  │
   │  App    │ AJAX │              │    │              │
   │         │      │ Port 10000   │    │ Port 10000   │
   └─────────┘      └──────┬───────┘    └──────┬───────┘
        │                  │                    │
        │                  └────────┬───────────┘
        │                           │
        │                           ▼
        │                  ┌─────────────────┐
        │                  │   SQLite DB     │
        └─────────────────▶│  /data/ems.db   │
             Displays      │                 │
               Data        │  admins table   │
                          │  users table    │
                          └─────────────────┘
```

---

## 📋 Step-by-Step Checklist

### Part 1: Backend Deployment (Render.com)

#### Step 1.1: Prepare
- [x] Code is ready in GitHub repository
- [ ] Run `generate-jwt-secret.ps1` to create JWT secret
- [ ] Copy the generated secret (you'll need it twice!)

#### Step 1.2: Sign Up on Render
```
1. Go to https://render.com
2. Click "Get Started"
3. Sign up with GitHub
4. Authorize Render to access your repositories
```

#### Step 1.3: Deploy with Blueprint
```
1. Click "New" (top right)
2. Select "Blueprint"
3. Connect your GitHub account if not already
4. Find "Vikram-Solar-Falta-EMS" repository
5. Click "Connect"
6. Render detects render.yaml automatically
7. You'll see 2 services:
   ✓ falta-ems-admin-api
   ✓ falta-ems-user-api
```

#### Step 1.4: Configure Environment Variables

**For ADMIN API:**
```
Click on "falta-ems-admin-api" → Environment tab
Add these variables:

Key: FALTA_EMS_DB_PATH
Value: /data/ems.sqlite

Key: FALTA_EMS_JWT_SECRET
Value: [PASTE YOUR JWT SECRET HERE]

Key: DASHBOARD_URL
Value: https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS

Key: NODE_ENV
Value: production
```

**For USER API:**
```
Click on "falta-ems-user-api" → Environment tab
Add SAME variables:

Key: FALTA_EMS_DB_PATH
Value: /data/ems.sqlite

Key: FALTA_EMS_JWT_SECRET
Value: [PASTE THE SAME JWT SECRET HERE] ⚠️ MUST BE IDENTICAL!

Key: DASHBOARD_URL
Value: https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS

Key: NODE_ENV
Value: production
```

#### Step 1.5: Deploy
```
1. Click "Apply" at the bottom
2. Wait 5-10 minutes for build
3. Watch the logs for any errors
4. Services will turn green when ready
```

#### Step 1.6: Note Your URLs
```
After deployment, you'll get URLs like:

Admin API: https://falta-ems-admin-api.onrender.com
User API: https://falta-ems-user-api.onrender.com

⚠️ Write these down! You need them for frontend.
```

---

### Part 2: Frontend Update

#### Step 2.1: Update Environment File
```
1. Open .env.production in your editor
2. Replace with your actual URLs:

VITE_USER_API_URL=https://falta-ems-user-api.onrender.com
VITE_ADMIN_API_URL=https://falta-ems-admin-api.onrender.com
VITE_LEAD_ADMIN_EMAIL=agniswar.banerjee@vikramsolar.com

3. Save the file
```

#### Step 2.2: Rebuild Frontend
```powershell
# In your project root directory
npm run build
```

This creates optimized production build in `dist/` folder with your production API URLs.

#### Step 2.3: Deploy to GitHub Pages
```powershell
npm run deploy
```

This pushes the `dist/` folder to `gh-pages` branch and deploys to GitHub Pages.

---

### Part 3: Testing

#### Test 3.1: Backend Health
```powershell
# Test admin API
curl https://falta-ems-admin-api.onrender.com/health

# Test user API
curl https://falta-ems-user-api.onrender.com/health

# Both should return:
# {"status":"ok","service":"..."}
```

#### Test 3.2: Create Admin Account
```powershell
# Run the test script
.\test-deployment.ps1

# Or manually create admin:
$body = @{
    email = "your-email@vikramsolar.com"
    password = "SecurePassword123!"
    fullName = "Your Name"
} | ConvertTo-Json

Invoke-RestMethod `
  -Uri "https://falta-ems-admin-api.onrender.com/api/admin/register" `
  -Method Post `
  -Body $body `
  -ContentType "application/json"
```

#### Test 3.3: Frontend Login
```
1. Open: https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/
2. Try to login with admin credentials
3. Should work! 🎉
```

---

## 🎨 Visual Flow Diagrams

### User Login Flow
```
┌─────────┐
│  User   │
│ Browser │
└────┬────┘
     │
     │ 1. Opens GitHub Pages URL
     ▼
┌────────────────┐
│  React App     │
│  (GitHub Pages)│
└────┬───────────┘
     │
     │ 2. Enters email & password
     │ 3. Clicks "Login"
     ▼
┌────────────────┐
│ POST /api/login│
│ to User API    │
└────┬───────────┘
     │
     │ 4. Verify credentials
     ▼
┌────────────────┐
│  User API      │
│  (Render)      │
└────┬───────────┘
     │
     │ 5. Check SQLite DB
     ▼
┌────────────────┐
│  Database      │
│  users table   │
└────┬───────────┘
     │
     │ 6. Password matches?
     ▼
┌────────────────┐
│  Generate JWT  │
│  token         │
└────┬───────────┘
     │
     │ 7. Return token
     ▼
┌────────────────┐
│  React App     │
│  saves token   │
└────┬───────────┘
     │
     │ 8. Redirect to dashboard
     ▼
┌────────────────┐
│  Dashboard     │
│  View          │
└────────────────┘
```

### Admin Creates User Flow
```
┌─────────┐
│  Admin  │
│ Browser │
└────┬────┘
     │
     │ 1. Logged in as admin
     │ 2. Goes to User Management
     │ 3. Clicks "Create User"
     ▼
┌────────────────┐
│  User Form     │
│  (React)       │
└────┬───────────┘
     │
     │ 4. Enters user details
     │ 5. Submits form
     ▼
┌────────────────────┐
│ POST /api/users    │
│ Bearer: admin-token│
└────┬───────────────┘
     │
     │ 6. Verify admin token
     ▼
┌────────────────┐
│  Admin API     │
│  (Render)      │
└────┬───────────┘
     │
     │ 7. Hash password
     │ 8. Insert into DB
     ▼
┌────────────────┐
│  Database      │
│  users table   │
└────┬───────────┘
     │
     │ 9. Send email (optional)
     ▼
┌────────────────┐
│  Email Service │
│  (Nodemailer)  │
└────┬───────────┘
     │
     │ 10. Return user data
     ▼
┌────────────────┐
│  Admin sees    │
│  success +     │
│  credentials   │
└────────────────┘
```

---

## 🔧 Configuration Summary

### What Goes Where

```
┌──────────────────────────────────────────────────────────┐
│ GitHub Repository (Your Code)                             │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  render.yaml                 ← Deployment config          │
│  .env.production             ← Frontend API URLs          │
│  backend/admin-server/       ← Admin API code            │
│  backend/user-server/        ← User API code             │
│  src/                        ← React frontend code        │
│                                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Render.com (Admin API Service)                            │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Environment Variables:                                    │
│  • FALTA_EMS_DB_PATH=/data/ems.sqlite                     │
│  • FALTA_EMS_JWT_SECRET=[your-secret]                     │
│  • DASHBOARD_URL=[github-pages-url]                       │
│  • NODE_ENV=production                                     │
│                                                            │
│  Persistent Disk:                                          │
│  • /data (1GB volume)                                      │
│                                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ Render.com (User API Service)                             │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Environment Variables:                                    │
│  • FALTA_EMS_DB_PATH=/data/ems.sqlite                     │
│  • FALTA_EMS_JWT_SECRET=[SAME secret as admin!]          │
│  • DASHBOARD_URL=[github-pages-url]                       │
│  • NODE_ENV=production                                     │
│                                                            │
│  Persistent Disk:                                          │
│  • /data (1GB volume, SHARED with Admin API)              │
│                                                            │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│ GitHub Pages (Frontend)                                    │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  URL: agniswarbanerjee05.github.io/...                    │
│  Branch: gh-pages                                          │
│  Contains: Built React app (dist/ folder)                 │
│                                                            │
│  Connects to:                                              │
│  • Admin API at Render                                     │
│  • User API at Render                                      │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

---

## ⚠️ Common Pitfalls to Avoid

### ❌ DON'T
- Use different JWT secrets for admin and user APIs
- Commit `.env.production` to git (keep it local or use secrets)
- Forget to update frontend URLs after backend deployment
- Skip the health check tests
- Use HTTP instead of HTTPS

### ✅ DO
- Use the SAME JWT secret for both services
- Test health endpoints before creating admin
- Update `.env.production` with actual deployed URLs
- Rebuild frontend after updating env file
- Keep JWT secret secure and random

---

## 📊 Monitoring Your Deployment

### Render Dashboard
```
1. Login to Render.com
2. See your services dashboard
3. Click on service name to see:
   • Logs (real-time)
   • Metrics (CPU, Memory)
   • Events (deployments, restarts)
   • Shell (access container)
```

### Check Service Status
```
🟢 Green = Running
🟡 Yellow = Building
🔴 Red = Failed
⚫ Gray = Suspended (sleeping on free tier)
```

### View Logs
```
1. Click on service
2. Click "Logs" tab
3. See real-time console output
4. Look for errors or warnings
```

---

## 🎓 Learning Resources

### Render Documentation
- Getting Started: https://render.com/docs/web-services
- Persistent Disks: https://render.com/docs/disks
- Environment Variables: https://render.com/docs/environment-variables

### Your Project Docs
- Quick Start: `DEPLOYMENT_QUICKSTART.md`
- Full Guide: `backend/DEPLOYMENT_GUIDE.md`
- Architecture: `ARCHITECTURE.md`

---

## 🎉 Success Checklist

When everything is working, you should have:

- ✅ Backend deployed on Render (2 services)
- ✅ Frontend deployed on GitHub Pages
- ✅ Health endpoints responding
- ✅ Admin account created
- ✅ Can login from frontend
- ✅ Can create users
- ✅ Users can login
- ✅ Dashboard loads data

**Congratulations! Your app is live! 🚀**

---

## 🆘 Still Having Issues?

### Check These Files:
1. `README_DEPLOYMENT.md` - Quick summary
2. `DEPLOYMENT_QUICKSTART.md` - Detailed steps
3. `backend/DEPLOYMENT_GUIDE.md` - Backend specific
4. `ARCHITECTURE.md` - System architecture

### Run These Commands:
```powershell
# Generate JWT secret
.\generate-jwt-secret.ps1

# Test deployment
.\test-deployment.ps1

# Check git status
git status

# Rebuild and deploy
npm run build
npm run deploy
```

### Check These URLs:
- Admin API Health: https://falta-ems-admin-api.onrender.com/health
- User API Health: https://falta-ems-user-api.onrender.com/health
- Frontend: https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/

---

**You've got this! 💪**
