# Quick Start: Deploy Backend & Connect to Frontend

## Overview
Your frontend is already on GitHub Pages. This guide will help you deploy the backend and connect everything together.

## Step-by-Step Deployment

### Option 1: Render.com (Recommended - Easiest)

#### 1. Push Your Code to GitHub
```powershell
git add .
git commit -m "Add backend deployment configuration"
git push origin main
```

#### 2. Sign Up on Render
- Go to https://render.com
- Sign up with GitHub
- Grant access to your repository

#### 3. Deploy Using Blueprint
1. Click **"New"** → **"Blueprint"**
2. Select your repository: `Vikram-Solar-Falta-EMS`
3. Render will detect `render.yaml` and show 2 services:
   - `falta-ems-admin-api`
   - `falta-ems-user-api`

#### 4. Configure Environment Variables

**IMPORTANT:** Both services need the **SAME** JWT secret!

For **both services**, set these in Render dashboard:

```
FALTA_EMS_DB_PATH=/data/ems.sqlite
FALTA_EMS_JWT_SECRET=<generate-a-strong-32-char-random-string>
DASHBOARD_URL=https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS
NODE_ENV=production
```

**Optional (for email notifications):**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=noreply@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS
```

#### 5. Deploy
- Click **"Apply"**
- Wait 5-10 minutes for both services to build and deploy
- You'll get URLs like:
  - `https://falta-ems-admin-api.onrender.com`
  - `https://falta-ems-user-api.onrender.com`

#### 6. Test Your Backend
Open in browser or use curl:
```powershell
curl https://falta-ems-admin-api.onrender.com/health
curl https://falta-ems-user-api.onrender.com/health
```

Should return: `{"status":"ok","service":"admin-server"}`

---

### Update Frontend to Connect to Backend

#### 1. Update `.env.production` file

Replace the URLs with your actual Render URLs:

```env
VITE_USER_API_URL=https://falta-ems-user-api.onrender.com
VITE_ADMIN_API_URL=https://falta-ems-admin-api.onrender.com
VITE_LEAD_ADMIN_EMAIL=agniswar.banerjee@vikramsolar.com
```

#### 2. Rebuild and Deploy Frontend

```powershell
npm run build
npm run deploy
```

This will:
1. Build frontend with production API URLs
2. Deploy to GitHub Pages

---

### Create Your First Admin Account

#### Option A: Using curl (PowerShell)

```powershell
$body = @{
    email = "agniswar.banerjee@vikramsolar.com"
    password = "YourSecurePassword123!"
    fullName = "Agniswar Banerjee"
} | ConvertTo-Json

Invoke-RestMethod -Uri "https://falta-ems-admin-api.onrender.com/api/admin/register" -Method Post -Body $body -ContentType "application/json"
```

#### Option B: Using Postman
1. POST to `https://falta-ems-admin-api.onrender.com/api/admin/register`
2. Body (JSON):
```json
{
  "email": "agniswar.banerjee@vikramsolar.com",
  "password": "YourSecurePassword123!",
  "fullName": "Agniswar Banerjee"
}
```

#### Option C: From Your Frontend
Just visit your GitHub Pages site and use the admin registration form!

---

## Testing Your Deployment

### 1. Test Backend Health
```powershell
curl https://falta-ems-admin-api.onrender.com/health
curl https://falta-ems-user-api.onrender.com/health
```

### 2. Test Frontend
1. Visit: `https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/`
2. Try to login (should connect to backend)
3. Check browser console (F12) for any errors

### 3. Check CORS
If you see CORS errors in browser console:
- Verify backend CORS configuration includes your GitHub Pages domain
- Check that both servers are running
- Ensure HTTPS is used (not HTTP)

---

## Common Issues & Solutions

### Issue: "Service Unavailable" or slow first load
**Solution:** Render free tier sleeps after 15 minutes inactivity. First request takes ~30 seconds to wake up. This is normal.

### Issue: "CORS Error" in browser
**Solution:** 
1. Check backend logs in Render dashboard
2. Verify CORS configuration includes `https://agniswarbanerjee05.github.io`
3. Make sure you're using HTTPS URLs, not HTTP

### Issue: "Database locked" error
**Solution:** Make sure both services use the same persistent disk:
- Both should have `FALTA_EMS_DB_PATH=/data/ems.sqlite`
- Both should mount the same disk at `/data`

### Issue: Login not working
**Solution:**
1. Verify JWT_SECRET is the SAME for both admin and user servers
2. Check backend logs for errors
3. Test health endpoints first

### Issue: Email not sending
**Solution:** Email is optional. If not configured, credentials are logged to console. Check Render logs.

---

## Alternative: Railway.app Deployment

If you prefer Railway.app:

1. Go to https://railway.app
2. **New Project** → **Deploy from GitHub**
3. Select your repository
4. Add 2 services:
   - **Admin Server**: Root Directory = `backend/admin-server`
   - **User Server**: Root Directory = `backend/user-server`
5. Add **Volume** to both services mounted at `/data`
6. Set environment variables (same as Render)
7. Deploy!

---

## Alternative: Fly.io Deployment

If you prefer Fly.io:

### Install Fly CLI
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

### Deploy Admin Server
```powershell
cd backend/admin-server
fly launch --name falta-ems-admin-api
fly volumes create falta_ems_data --size 1
fly deploy
```

### Deploy User Server
```powershell
cd backend/user-server
fly launch --name falta-ems-user-api
fly volumes create falta_ems_data --size 1
fly deploy
```

---

## Monitoring Your Deployment

### Check Logs on Render
1. Go to Render dashboard
2. Click on service name
3. Click **"Logs"** tab
4. View real-time logs

### Monitor Database
The SQLite database is stored in `/data/ems.sqlite` on the persistent disk.

### Backup Database
Download from Render:
1. Go to service → **Shell** tab
2. Run: `cat /data/ems.sqlite | base64`
3. Copy output and decode locally

---

## Next Steps After Deployment

1. ✅ Create admin account
2. ✅ Test login from frontend
3. ✅ Create test user accounts
4. ✅ Test user login
5. ✅ Monitor logs for errors
6. 📧 Configure email (optional)
7. 🔒 Set up database backups
8. 📊 Monitor usage on free tier

---

## Cost Considerations

### Render Free Tier
- ✅ 750 hours/month (enough for 1 service 24/7)
- ⚠️ Services sleep after 15 min inactivity
- ⚠️ You have 2 services, so you might hit limit
- 💡 Consider upgrading to $7/month per service for always-on

### Railway Free Tier
- $5 free credit per month (~140 hours)
- Better for testing, not production

### Fly.io Free Tier
- 3 VMs with 256MB RAM each
- Good for small production apps
- More technical setup

---

## Production Checklist

Before going live with real users:

- [ ] Backend deployed and accessible
- [ ] Frontend connects to backend
- [ ] CORS properly configured
- [ ] HTTPS enabled (automatic on Render/Railway/Fly)
- [ ] Strong JWT secret set (32+ characters)
- [ ] Admin account created
- [ ] Test user account created and tested
- [ ] Email configured (or logging acknowledged)
- [ ] Database backup strategy in place
- [ ] Monitoring/logging set up
- [ ] Consider upgrading to paid tier for 24/7 uptime

---

## Support

If you run into issues:

1. Check Render/Railway/Fly logs
2. Check browser console (F12)
3. Test backend health endpoints
4. Verify environment variables
5. Check CORS configuration
6. Review `backend/DEPLOYMENT_GUIDE.md` for detailed troubleshooting

Good luck with your deployment! 🚀
