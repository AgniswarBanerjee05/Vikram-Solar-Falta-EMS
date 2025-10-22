# 🚀 Development Guide - Falta EMS

## Quick Start

### Start All Servers (Frontend + Backend)

```powershell
npm run dev
```

This single command will start:
- ✅ **Vite Dev Server** (Frontend) - Port 5173
- ✅ **Admin Server** (Backend) - Port 4000
- ✅ **User Server** (Backend) - Port 5000

All servers run concurrently with color-coded output:
- **VITE** (cyan) - Frontend development server
- **ADMIN** (yellow) - Admin API server
- **USER** (green) - User API server

### Stop All Servers

Press `Ctrl+C` once in the terminal - this will stop all three servers simultaneously.

---

## Available Commands

### Development

```powershell
# Start everything (Vite + Admin + User servers)
npm run dev

# Start only frontend (Vite)
npm run dev:frontend

# Start only backend servers (Admin + User)
npm run start:servers

# Start only Admin server
npm run dev:admin

# Start only User server
npm run dev:user
```

### Build & Deploy

```powershell
# Build for production
npm run build

# Preview production build locally
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## Session Behavior

### ✅ **New Behavior (Fixed)**

Sessions now use **sessionStorage** instead of localStorage:

- **Login** → Session active in current tab/window
- **Refresh page** → Session persists (same tab)
- **Close browser/tab** → Session cleared
- **Open new tab** → Must login again
- **Restart servers** → Shows login page (sessions cleared)

### Why This is Better

1. **Security**: Sessions don't persist forever
2. **Development**: Always see login page on server restart
3. **Clean state**: Each browser session starts fresh
4. **Expected UX**: Like most web applications

---

## Development Workflow

### Typical Day Workflow

```powershell
# Morning - Start work
npm run dev

# Work on features...
# (All 3 servers running)

# Lunch break - Close terminal (Ctrl+C)
# Servers stop automatically

# After lunch - Resume
npm run dev

# Evening - Done for the day
# Close terminal or Ctrl+C
```

### Testing Workflow

```powershell
# Start servers
npm run dev

# Test admin features
# Navigate to: http://localhost:5173/login
# Login as admin

# Restart to test fresh login
# Press Ctrl+C (stops all servers)
npm run dev
# Opens to login page ✅

# Test user features
# Navigate to: http://localhost:5173/login
# Login as user
```

---

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| Frontend (Vite) | 5173 | http://localhost:5173 |
| Admin Server | 4000 | http://localhost:4000 |
| User Server | 5000 | http://localhost:5000 |

---

## Troubleshooting

### "Port already in use"

One of the servers is already running. Stop it first:

```powershell
# Find and kill Node processes
Get-Process node | Stop-Process -Force
```

Then restart:

```powershell
npm run dev
```

### "Cannot find module concurrently"

Install dependencies:

```powershell
npm install
```

### Still seeing old logged-in session

Clear browser storage manually:
1. Open browser DevTools (F12)
2. Go to Application tab
3. Clear all storage
4. Refresh page

Or use incognito/private browsing mode.

### Servers don't stop together

If `Ctrl+C` doesn't stop all servers:

```powershell
# Force kill all node processes
Get-Process node | Stop-Process -Force
```

---

## Production Deployment

### GitHub Pages

```powershell
# Build and deploy
npm run deploy
```

### Backend Servers

Backend servers need to be deployed separately (e.g., Render.com):

1. **Admin Server**: Deploy `backend/admin-server`
2. **User Server**: Deploy `backend/user-server`
3. **Shared Code**: Automatically included in both

Update API URLs in production build to point to deployed servers.

---

## Tips

### Speed Up Development

Start only what you need:

```powershell
# Frontend only (if backend already running elsewhere)
npm run dev:frontend

# Backend only (if testing APIs)
npm run start:servers
```

### Multiple Terminals

If you prefer separate terminals:

```powershell
# Terminal 1
npm run dev:frontend

# Terminal 2
npm run dev:admin

# Terminal 3
npm run dev:user
```

### Auto-restart on Changes

All servers watch for file changes and auto-restart:
- **Vite**: Instant HMR (Hot Module Replacement)
- **Admin/User servers**: Auto-restart on file changes

---

## Summary

✅ **One command** to start everything: `npm run dev`  
✅ **One action** to stop everything: `Ctrl+C`  
✅ **Clean sessions** every time you restart  
✅ **Color-coded output** to see which server logged what  
✅ **Simple workflow** for daily development  

Happy coding! 🚀
