# 🔐 Security Deployment Checklist

## Pre-Deployment Security Setup

### ✅ Completed
- [x] AES-256-GCM encryption implemented
- [x] Enhanced JWT security (HS512, fingerprinting)
- [x] Password strength validation
- [x] Rate limiting and brute force protection
- [x] Security headers (Helmet)
- [x] Input sanitization middleware
- [x] Secure environment configuration generated
- [x] Security documentation created
- [x] Dependencies installed (helmet, express-rate-limit)

### 📋 Next Steps (Before Going Live)

#### 1. Environment Configuration
```bash
# Copy the secure environment file
cd backend
cp .env.secure .env

# Edit .env and update:
nano .env  # or use any text editor
```

Update these values in `.env`:
```bash
# Your Gmail for notifications
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASSWORD=your-gmail-app-password

# Your production URL
DASHBOARD_URL=https://agniswarbanerjee05.github.io/Vikram-Solar-Falta-EMS/

# Production CORS (for strict security)
ALLOWED_ORIGINS=https://agniswarbanerjee05.github.io

# Set production mode
NODE_ENV=production
```

#### 2. Email Setup (Important!)
To get Gmail App Password:
1. Go to Google Account → Security
2. Enable 2-Step Verification
3. Generate App Password for "Mail"
4. Copy the 16-character password
5. Paste in EMAIL_PASSWORD in .env

#### 3. File Permissions (Linux/Mac)
```bash
# Protect sensitive files
chmod 600 backend/.env
chmod 600 backend/.env.secure
chmod 600 backend/data/falta_ems.db
```

#### 4. SSL/HTTPS Setup
For production, ensure:
- [ ] SSL certificate installed (Let's Encrypt recommended)
- [ ] Force HTTPS in nginx/Apache
- [ ] HSTS header enabled (already in code)
- [ ] Certificate auto-renewal configured

#### 5. Server Security (Production Server)
```bash
# Update system
sudo apt update && sudo apt upgrade

# Install firewall
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable

# Install fail2ban (prevents brute force)
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

#### 6. Database Backup
```bash
# Create backup script
cd backend/data
cp falta_ems.db falta_ems.db.backup-$(date +%Y%m%d)

# Schedule daily backups (crontab -e)
0 2 * * * cd /path/to/backend/data && cp falta_ems.db falta_ems.db.backup-$(date +%Y%m%d)
```

#### 7. Monitoring Setup
```bash
# Install PM2 for process management
npm install -g pm2

# Start servers with PM2
cd backend/admin-server
pm2 start src/index.js --name falta-admin-server

cd ../user-server
pm2 start src/index.js --name falta-user-server

# Save PM2 configuration
pm2 save
pm2 startup
```

#### 8. Security Audit
```bash
# Check for vulnerabilities
cd backend/admin-server
npm audit

cd ../user-server
npm audit

cd ../..
npm audit

# Fix vulnerabilities
npm audit fix
```

#### 9. Test Security Features
```bash
# Test rate limiting (should block after 10 attempts)
for i in {1..11}; do
  curl -X POST http://localhost:4000/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
  echo ""
done

# Test password strength
curl -X POST http://localhost:4000/api/admin/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"weak","fullName":"Test"}'
# Should return password strength errors
```

#### 10. Logging Setup
```bash
# Create logs directory
mkdir -p backend/logs

# Configure log rotation
sudo nano /etc/logrotate.d/falta-ems
```

Add:
```
/path/to/backend/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

### 🔒 Production Security Checklist

Before going live:
- [ ] `.env` file configured with real credentials
- [ ] Gmail app password set up
- [ ] HTTPS/SSL certificate installed
- [ ] Firewall configured (UFW/iptables)
- [ ] fail2ban installed and configured
- [ ] Database backed up
- [ ] PM2 process manager configured
- [ ] Log rotation configured
- [ ] Security audit passed (`npm audit`)
- [ ] All tests passing
- [ ] CORS origins set for production
- [ ] Error handling tested
- [ ] Rate limiting tested
- [ ] Password policies tested

### 🚀 Starting the Servers

#### Development Mode:
```bash
# Terminal 1 - Admin Server
cd backend/admin-server
npm start

# Terminal 2 - User Server
cd backend/user-server
npm start

# Terminal 3 - Frontend (if needed)
npm run dev
```

#### Production Mode (with PM2):
```bash
# Start all servers
pm2 start ecosystem.config.js

# View logs
pm2 logs

# Monitor
pm2 monit

# Restart
pm2 restart all

# Stop
pm2 stop all
```

### 📊 Security Monitoring

#### Check Logs Regularly:
```bash
# View security logs
pm2 logs falta-admin-server | grep SECURITY
pm2 logs falta-user-server | grep SECURITY

# Check for failed logins
pm2 logs | grep "Invalid credentials"

# Monitor rate limiting
pm2 logs | grep "Rate limit exceeded"
```

#### Weekly Tasks:
- [ ] Review security logs
- [ ] Check failed login attempts
- [ ] Verify backup integrity
- [ ] Update dependencies
- [ ] Check disk space

#### Monthly Tasks:
- [ ] Rotate secrets (JWT_SECRET recommended quarterly)
- [ ] Review user accounts
- [ ] Audit admin access
- [ ] Test disaster recovery
- [ ] Security patch updates

#### Quarterly Tasks:
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Compliance review
- [ ] Backup restoration test

### 🆘 Emergency Procedures

#### If Breach Suspected:
1. **Immediate Actions**:
   ```bash
   # Stop all servers
   pm2 stop all
   
   # Lock database
   chmod 000 backend/data/falta_ems.db
   
   # Rotate all secrets
   node setup-security.cjs
   ```

2. **Investigation**:
   - Review logs: `pm2 logs --lines 1000`
   - Check database for unauthorized changes
   - Review failed login attempts
   - Check for unusual IP addresses

3. **Recovery**:
   - Update all secrets in `.env`
   - Force logout all users
   - Reset affected passwords
   - Restore from backup if needed
   - Document incident

### 📞 Support Contacts

- **Server Issues**: Check PM2 logs
- **Email Issues**: Verify Gmail App Password
- **Security Concerns**: Review SECURITY_GUIDE.md
- **Database Issues**: Check backup files

### ✅ Final Verification

Before declaring "Production Ready":
```bash
# 1. Test login with real credentials
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email","password":"your-password"}'

# 2. Test user creation
# (Login as admin first, get token)

# 3. Test rate limiting
# (Run rapid requests)

# 4. Check security headers
curl -I http://localhost:4000/health

# 5. Verify HTTPS (in production)
curl -I https://your-domain.com
```

### 🎉 Launch!

When all checks pass:
1. Deploy to production server
2. Start with PM2
3. Monitor for first 24 hours
4. Schedule regular security reviews

---

**Security is an ongoing process. Stay vigilant! 🛡️**
