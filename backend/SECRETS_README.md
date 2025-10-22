# Secrets Management

## Generated Secrets

This directory contains securely generated secrets for your application.

**CRITICAL SECURITY NOTES:**

1. **NEVER** commit these files to version control
2. **NEVER** share these secrets via email or messaging
3. **ROTATE** secrets regularly (every 90 days recommended)
4. **BACKUP** secrets securely (use encrypted storage)

## Setup Instructions

1. Copy `.env.secure` to `.env`:
   ```bash
   cp backend/.env.secure backend/.env
   ```

2. Update the following in `.env`:
   - EMAIL_USER: Your Gmail address
   - EMAIL_PASSWORD: Your Gmail App Password
   - DASHBOARD_URL: Your production URL
   - ALLOWED_ORIGINS: Your frontend domains

3. Set proper file permissions:
   ```bash
   chmod 600 backend/.env
   ```

## Environment Variables

### JWT_SECRET
- **Purpose**: Signs and verifies JWT tokens
- **Length**: 128 characters (512 bits)
- **Algorithm**: HMAC-SHA512

### ENCRYPTION_KEY
- **Purpose**: Encrypts sensitive data
- **Length**: 64 characters (256 bits)
- **Algorithm**: AES-256-GCM

### SESSION_SECRET
- **Purpose**: Signs session cookies
- **Length**: 64 characters (256 bits)
- **Algorithm**: HMAC-SHA256

## Security Checklist

- [ ] Secrets generated and stored securely
- [ ] .env file added to .gitignore
- [ ] Email configuration completed
- [ ] CORS origins configured for production
- [ ] SSL/TLS certificates installed
- [ ] Firewall rules configured
- [ ] Regular backups scheduled
- [ ] Security monitoring enabled

## Rotation Schedule

Rotate secrets on this schedule:
- JWT_SECRET: Every 90 days
- ENCRYPTION_KEY: Every 180 days
- SESSION_SECRET: Every 90 days
- Email passwords: Every 180 days or when compromised

To rotate:
1. Run: `node setup-security.js`
2. Update `.env` with new secrets
3. Force re-login for all users
4. Update backups with new configuration

## Support

For security issues:
- Review SECURITY_GUIDE.md
- Check logs for security events
- Contact your security team immediately
