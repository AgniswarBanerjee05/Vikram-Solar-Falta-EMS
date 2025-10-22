#!/usr/bin/env node

/**
 * Security Setup Script for Falta EMS
 * Generates secure environment configuration
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

console.log('🔐 Falta EMS Security Setup\n');

// Generate secure JWT secret
const jwtSecret = crypto.randomBytes(64).toString('hex');
console.log('✅ Generated JWT Secret');

// Generate encryption key
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('✅ Generated Encryption Key');

// Generate session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('✅ Generated Session Secret');

// Create secure .env content
const envContent = `# ================================================
# Falta EMS Backend Configuration - SECURE
# ================================================
# Generated on: ${new Date().toISOString()}
# WARNING: Keep this file SECRET and NEVER commit to version control!

# Server Ports
ADMIN_SERVER_PORT=4000
USER_SERVER_PORT=5000

# Security - CRITICAL: Use these generated secrets
JWT_SECRET=${jwtSecret}
ENCRYPTION_KEY=${encryptionKey}
SESSION_SECRET=${sessionSecret}

# Environment
NODE_ENV=production

# Allowed CORS Origins (comma-separated)
# ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com

# ================================================
# Email Configuration
# ================================================
# IMPORTANT: Configure these to enable email notifications

# GMAIL Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Sender Information
EMAIL_FROM=your-email@gmail.com
EMAIL_FROM_NAME=Vikram Solar - Falta EMS

# Dashboard URL
DASHBOARD_URL=https://your-domain.com

# ================================================
# Rate Limiting Configuration
# ================================================
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
AUTH_RATE_LIMIT_MAX=10

# ================================================
# Database Configuration (optional)
# ================================================
# DB_PATH=./data/falta_ems.db
`;

// Write to .env.secure
const envPath = path.join(__dirname, 'backend', '.env.secure');
fs.writeFileSync(envPath, envContent, 'utf8');
console.log(`✅ Created secure environment file: ${envPath}\n`);

// Create .gitignore entry
const gitignorePath = path.join(__dirname, '.gitignore');
let gitignoreContent = '';

if (fs.existsSync(gitignorePath)) {
  gitignoreContent = fs.readFileSync(gitignorePath, 'utf8');
}

const securityEntries = `
# Security - Never commit these files
.env
.env.local
.env.production
.env.secure
backend/.env
backend/.env.secure
*.key
*.pem
*.p12
secrets/
`;

if (!gitignoreContent.includes('.env.secure')) {
  fs.appendFileSync(gitignorePath, securityEntries, 'utf8');
  console.log('✅ Updated .gitignore with security entries');
}

// Create README for secrets
const secretsReadme = `# Secrets Management

## Generated Secrets

This directory contains securely generated secrets for your application.

**CRITICAL SECURITY NOTES:**

1. **NEVER** commit these files to version control
2. **NEVER** share these secrets via email or messaging
3. **ROTATE** secrets regularly (every 90 days recommended)
4. **BACKUP** secrets securely (use encrypted storage)

## Setup Instructions

1. Copy \`.env.secure\` to \`.env\`:
   \`\`\`bash
   cp backend/.env.secure backend/.env
   \`\`\`

2. Update the following in \`.env\`:
   - EMAIL_USER: Your Gmail address
   - EMAIL_PASSWORD: Your Gmail App Password
   - DASHBOARD_URL: Your production URL
   - ALLOWED_ORIGINS: Your frontend domains

3. Set proper file permissions:
   \`\`\`bash
   chmod 600 backend/.env
   \`\`\`

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
1. Run: \`node setup-security.js\`
2. Update \`.env\` with new secrets
3. Force re-login for all users
4. Update backups with new configuration

## Support

For security issues:
- Review SECURITY_GUIDE.md
- Check logs for security events
- Contact your security team immediately
`;

fs.writeFileSync(path.join(__dirname, 'backend', 'SECRETS_README.md'), secretsReadme, 'utf8');
console.log('✅ Created secrets documentation\n');

console.log('🎉 Security setup complete!\n');
console.log('📋 Next steps:');
console.log('   1. Copy backend/.env.secure to backend/.env');
console.log('   2. Update email configuration in backend/.env');
console.log('   3. Set ALLOWED_ORIGINS for production');
console.log('   4. Review SECURITY_GUIDE.md for best practices');
console.log('   5. Never commit .env files to version control!\n');
console.log('⚠️  IMPORTANT: Keep your secrets safe and rotate them regularly!\n');
