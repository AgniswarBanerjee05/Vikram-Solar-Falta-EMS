# Falta EMS - Full Stack Architecture

## Current Architecture (After Deployment)

```
┌─────────────────────────────────────────────────────────────────┐
│                         INTERNET                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────────┐   ┌──────────────┐
│   GitHub     │    │   Render.com     │   │  Render.com  │
│   Pages      │    │   (Admin API)    │   │  (User API)  │
│              │    │                  │   │              │
│  Frontend    │    │  Port 10000      │   │  Port 10000  │
│  (React +    │    │                  │   │              │
│   Vite)      │    │  /api/admin/*    │   │  /api/login  │
│              │    │  /api/users/*    │   │  /api/me/*   │
└──────┬───────┘    └────────┬─────────┘   └──────┬───────┘
       │                     │                     │
       │   HTTPS Requests    │   Shared Database   │
       └─────────────────────┼─────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  SQLite Database│
                    │  (Persistent    │
                    │   Volume /data) │
                    │                 │
                    │  - admins table │
                    │  - users table  │
                    └─────────────────┘
```

## Flow Diagram

### Admin Flow
```
1. Admin visits GitHub Pages
   └─> https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/

2. Admin logs in
   └─> Frontend sends POST to https://falta-ems-admin-api.onrender.com/api/admin/login
   └─> Backend verifies credentials, returns JWT token
   └─> Frontend stores token in localStorage

3. Admin manages users
   └─> Frontend sends requests with Bearer token
   └─> POST /api/users (create user)
   └─> GET /api/users (list users)
   └─> PUT /api/users/:id (update user)
   └─> DELETE /api/users/:id (delete user)
   └─> POST /api/users/:id/reset-password (reset password)
```

### User Flow
```
1. User visits GitHub Pages
   └─> https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/

2. User logs in
   └─> Frontend sends POST to https://falta-ems-user-api.onrender.com/api/login
   └─> Backend verifies credentials, returns JWT token
   └─> Frontend stores token in localStorage

3. User views dashboard
   └─> Frontend sends GET to /api/me with Bearer token
   └─> Backend returns user profile
   └─> User can change password via PUT /api/me/password
```

## Technology Stack

### Frontend (GitHub Pages)
- **Framework**: React 18
- **Build Tool**: Vite
- **UI**: Tailwind CSS
- **Charts**: Chart.js
- **Routing**: React Router
- **HTTP Client**: Axios
- **Hosting**: GitHub Pages (Free)
- **URL**: https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/

### Backend (Render.com)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: SQLite with better-sqlite3
- **Auth**: JWT (jsonwebtoken)
- **Password**: bcrypt
- **Validation**: Zod
- **CORS**: cors middleware
- **Email**: Nodemailer (optional)
- **Hosting**: Render.com (Free tier with 750hrs/month)

## Environment Configuration

### Development (.env)
```env
VITE_USER_API_URL=http://localhost:5000
VITE_ADMIN_API_URL=http://localhost:4000
```

### Production (.env.production)
```env
VITE_USER_API_URL=https://falta-ems-user-api.onrender.com
VITE_ADMIN_API_URL=https://falta-ems-admin-api.onrender.com
```

### Backend Environment Variables (Render Dashboard)
```env
# Required
FALTA_EMS_DB_PATH=/data/ems.sqlite
FALTA_EMS_JWT_SECRET=<32-char-random-string>
DASHBOARD_URL=https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS
NODE_ENV=production

# Optional (Email)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_FROM=noreply@vikramsolar.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS
```

## Security Features

1. **HTTPS Everywhere**: All connections use HTTPS
2. **JWT Authentication**: Secure token-based auth
3. **Password Hashing**: bcrypt with salt
4. **CORS Protection**: Only allowed origins can access API
5. **Role-Based Access**: Admin vs User roles
6. **Input Validation**: Zod schemas validate all inputs
7. **SQL Injection Protection**: Prepared statements

## Database Schema

### admins table
```sql
CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  plain_password TEXT,  -- For development/testing only
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### users table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  status TEXT DEFAULT 'ACTIVE',
  plain_password TEXT,  -- For development/testing only
  created_by INTEGER REFERENCES admins(id),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Admin API (Port 10000)
```
GET  /health                          - Health check
POST /api/admin/register              - Create admin account
POST /api/admin/login                 - Admin login
POST /api/users                       - Create user (auth required)
GET  /api/users                       - List users (auth required)
GET  /api/users/:id                   - Get user (auth required)
PUT  /api/users/:id                   - Update user (auth required)
DELETE /api/users/:id                 - Delete user (auth required)
POST /api/users/:id/reset-password    - Reset user password (auth required)
```

### User API (Port 10000)
```
GET  /health                          - Health check
POST /api/login                       - User login
GET  /api/me                          - Get profile (auth required)
PUT  /api/me/password                 - Change password (auth required)
```

## Deployment Platforms Comparison

| Feature | Render.com | Railway.app | Fly.io |
|---------|-----------|-------------|---------|
| Free Tier | 750 hrs/month | $5 credit/month | 3 shared VMs |
| Persistent Storage | ✅ Disk | ✅ Volume | ✅ Volume |
| Auto Sleep | ⚠️ Yes (15 min) | ⚠️ Yes | ❌ No |
| HTTPS | ✅ Auto | ✅ Auto | ✅ Auto |
| GitHub Integration | ✅ Excellent | ✅ Good | ⚠️ CLI only |
| Setup Difficulty | 🟢 Easy | 🟢 Easy | 🟡 Moderate |
| **Recommendation** | ⭐ Best for beginners | Good alternative | Best for production |

## Cost Breakdown

### Free Tier (Current Setup)
- GitHub Pages: $0/month (Free forever)
- Render Admin API: $0/month (Free tier, sleeps after 15 min)
- Render User API: $0/month (Free tier, sleeps after 15 min)
- **Total: $0/month**

### Production-Ready Setup
- GitHub Pages: $0/month (Free forever)
- Render Admin API: $7/month (Starter plan, always on)
- Render User API: $7/month (Starter plan, always on)
- **Total: $14/month**

### Alternative: Railway Production
- GitHub Pages: $0/month
- Railway (both APIs): ~$10-15/month based on usage
- **Total: ~$10-15/month**

### Alternative: Fly.io Production
- GitHub Pages: $0/month
- Fly.io (2 apps): $0-5/month (free tier sufficient for small usage)
- **Total: $0-5/month**

## Monitoring & Maintenance

### What to Monitor
1. **Backend Logs**: Check for errors in Render dashboard
2. **API Response Times**: First request after sleep takes ~30s
3. **Database Size**: SQLite file grows with users
4. **Free Tier Usage**: 750 hours = ~31 days for 1 service

### Backup Strategy
1. **Manual Backup**: Download `/data/ems.sqlite` from Render Shell
2. **Automated Backup**: Set up cron job to backup to S3/Google Drive
3. **Frequency**: Daily or weekly depending on usage

### Scaling Considerations
- **Current**: Free tier suitable for <50 users
- **Small Team**: 50-200 users → Upgrade to Render Starter ($7/service)
- **Medium Team**: 200-1000 users → Consider PostgreSQL + better hosting
- **Enterprise**: >1000 users → Dedicated infrastructure needed

## Troubleshooting Common Issues

### Issue: Slow first load
**Cause**: Render free tier sleeps after 15 min inactivity
**Solution**: Upgrade to paid tier OR accept 30s wake time

### Issue: CORS errors
**Cause**: Backend not allowing GitHub Pages origin
**Solution**: Verify CORS config includes your GitHub Pages URL

### Issue: 401 Unauthorized
**Cause**: JWT token expired or invalid
**Solution**: Re-login to get new token

### Issue: Database locked
**Cause**: Both services trying to write simultaneously
**Solution**: SQLite handles this, but consider PostgreSQL for heavy writes

### Issue: 500 Server Error
**Cause**: Backend crash or misconfiguration
**Solution**: Check Render logs for stack trace

## Next Steps

1. ✅ Deploy backend to Render
2. ✅ Update frontend .env.production
3. ✅ Rebuild and redeploy frontend
4. ✅ Create admin account
5. ✅ Test full flow
6. 📧 Configure email notifications
7. 🔒 Set up database backups
8. 📊 Monitor usage
9. 💰 Consider upgrading for production use

## Resources

- **Render Docs**: https://render.com/docs
- **Railway Docs**: https://docs.railway.app
- **Fly.io Docs**: https://fly.io/docs
- **GitHub Pages Docs**: https://docs.github.com/pages
- **Project Repo**: https://github.com/AgniswarBanerjee05/Vikram-Solar-Falta-EMS
