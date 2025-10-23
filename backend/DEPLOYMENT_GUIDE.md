# Backend Deployment Guide

## Overview
This guide will help you deploy the Falta EMS backend servers to the internet and connect them with your GitHub Pages frontend.

## Option 1: Render.com (Recommended)

### Why Render?
- ✅ Free tier available (750 hours/month)
- ✅ Persistent disk storage for SQLite database
- ✅ Easy deployment from GitHub
- ✅ Automatic HTTPS
- ✅ Environment variables support
- ✅ Can deploy multiple services

### Steps to Deploy on Render

#### 1. Prepare Your Repository

First, create a `render.yaml` file in your project root to define both services:

```yaml
# render.yaml (already created for you)
services:
  - type: web
    name: falta-ems-admin-api
    runtime: node
    buildCommand: cd backend/admin-server && npm install && cd ../shared && npm install
    startCommand: cd backend/admin-server && npm start
    envVars:
      - key: FALTA_EMS_DB_PATH
        value: /data/ems.sqlite
      - key: FALTA_EMS_JWT_SECRET
        generateValue: true
      - key: ADMIN_SERVER_PORT
        value: 10000
      - key: NODE_ENV
        value: production
    disk:
      name: falta-ems-data
      mountPath: /data
      sizeGB: 1

  - type: web
    name: falta-ems-user-api
    runtime: node
    buildCommand: cd backend/user-server && npm install && cd ../shared && npm install
    startCommand: cd backend/user-server && npm start
    envVars:
      - key: FALTA_EMS_DB_PATH
        value: /data/ems.sqlite
      - key: FALTA_EMS_JWT_SECRET
        sync: false  # Should match admin server
      - key: USER_SERVER_PORT
        value: 10000
      - key: NODE_ENV
        value: production
    disk:
      name: falta-ems-data
      mountPath: /data
      sizeGB: 1
```

#### 2. Sign Up and Connect Repository

1. Go to [render.com](https://render.com) and sign up
2. Click "New" → "Blueprint"
3. Connect your GitHub repository
4. Render will detect the `render.yaml` file

#### 3. Configure Environment Variables

Add these environment variables in Render dashboard for BOTH services:

**Required:**
- `FALTA_EMS_DB_PATH`: `/data/ems.sqlite`
- `FALTA_EMS_JWT_SECRET`: (use the same secret for both - generate a strong one)
- `DASHBOARD_URL`: `https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS`

**Optional (for email):**
- `EMAIL_USER`: Your SMTP email
- `EMAIL_PASSWORD`: Your SMTP password/app password
- `EMAIL_HOST`: `smtp.gmail.com` (or your provider)
- `EMAIL_PORT`: `587`
- `EMAIL_SECURE`: `false`
- `EMAIL_FROM`: `noreply@vikramsolar.com`
- `EMAIL_FROM_NAME`: `Vikram Solar - Falta EMS`

#### 4. Deploy

Click "Apply" and Render will:
- Build both services
- Deploy them with persistent storage
- Provide URLs like:
  - `https://falta-ems-admin-api.onrender.com`
  - `https://falta-ems-user-api.onrender.com`

---

## Option 2: Railway.app

### Why Railway?
- ✅ $5 free credit monthly
- ✅ Easy deployment
- ✅ Persistent volumes for SQLite
- ✅ Great for Node.js

### Steps:

1. Go to [railway.app](https://railway.app)
2. Create new project → Deploy from GitHub
3. Add two services (admin-server and user-server)
4. Add persistent volume at `/data` for SQLite
5. Configure environment variables
6. Deploy

Railway will provide URLs for both services.

---

## Option 3: Fly.io

### Why Fly.io?
- ✅ Free tier (3 shared-cpu VMs)
- ✅ Persistent volumes
- ✅ Good performance
- ✅ Multiple regions

### Steps:

1. Install Fly CLI: [https://fly.io/docs/hands-on/install-flyctl/](https://fly.io/docs/hands-on/install-flyctl/)
2. Run `fly launch` in backend/admin-server and backend/user-server
3. Create volumes for persistent storage
4. Deploy with `fly deploy`

---

## Connecting Frontend to Deployed Backend

Once your backend is deployed, you need to update your frontend to point to the production URLs.

### Update Environment Variables

1. Create a `.env.production` file in your project root:

```env
VITE_USER_API_URL=https://your-user-api.onrender.com
VITE_ADMIN_API_URL=https://your-admin-api.onrender.com
VITE_LEAD_ADMIN_EMAIL=agniswar.banerjee@vikramsolar.com
```

2. Update your deployment script in `package.json` to use production env:

```json
"predeploy": "npm run build",
"deploy": "gh-pages -d dist"
```

### Rebuild and Redeploy Frontend

```bash
npm run build
npm run deploy
```

This will rebuild your frontend with the production API URLs and deploy to GitHub Pages.

---

## CORS Configuration

Your backend needs to allow requests from your GitHub Pages domain.

Update both `backend/admin-server/src/index.js` and `backend/user-server/src/index.js`:

```javascript
const corsOptions = {
  origin: [
    'http://localhost:5173',
    'https://agniswarbanerjee05.github.io'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

---

## Testing Your Deployment

1. **Test Backend Health:**
   ```bash
   curl https://your-admin-api.onrender.com/health
   curl https://your-user-api.onrender.com/health
   ```

2. **Test Frontend Connection:**
   - Open your GitHub Pages site
   - Try to login
   - Check browser console for any CORS errors

---

## Important Notes

### Database Persistence
- Make sure persistent storage/volumes are configured
- SQLite file must be in a persistent directory
- Back up your database regularly

### Security
- Use strong JWT secrets (32+ random characters)
- Enable HTTPS (provided by default on Render/Railway/Fly)
- Set proper CORS origins
- Don't commit `.env` files to GitHub

### Free Tier Limitations
- **Render**: Services sleep after 15 minutes of inactivity (first request takes ~30s to wake up)
- **Railway**: $5/month credit (~140 hours)
- **Fly.io**: 3 VMs, limited resources

### Environment Variables Checklist
- [ ] FALTA_EMS_DB_PATH
- [ ] FALTA_EMS_JWT_SECRET (same for both servers!)
- [ ] DASHBOARD_URL
- [ ] EMAIL_* variables (optional)
- [ ] NODE_ENV=production

---

## Troubleshooting

### Backend won't start
- Check logs in hosting dashboard
- Verify all environment variables are set
- Ensure shared dependencies are installed

### Frontend can't connect
- Check CORS configuration
- Verify API URLs in frontend `.env.production`
- Check browser console for errors
- Test backend health endpoints

### Database errors
- Verify persistent storage is mounted
- Check file permissions
- Ensure FALTA_EMS_DB_PATH points to writable location

---

## Next Steps

After deployment:
1. Create initial admin account
2. Test user creation and login flows
3. Monitor logs for errors
4. Set up database backups
5. Consider upgrading to paid tier if needed for production use
