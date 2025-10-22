# Security Best Practices for Falta EMS

## 🔐 Encryption & Security Features Implemented

### 1. **AES-256-GCM Encryption**
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with 100,000 iterations using SHA-512
- **Authentication**: Built-in authentication tags prevent tampering
- **Random Salt & IV**: Each encryption uses unique salt and initialization vector

### 2. **Enhanced JWT Security**
- **Algorithm**: HS512 (stronger than default HS256)
- **Token Fingerprinting**: Prevents token tampering
- **Unique Token IDs**: Each token has a UUID (jti claim)
- **Short Expiration**: 2-hour default expiration time

### 3. **Password Security**
- **Hashing**: bcrypt with 12 salt rounds
- **Strength Validation**: Enforces:
  - Minimum 8 characters
  - Uppercase and lowercase letters
  - Numbers and special characters
- **Secure Generation**: Cryptographically random passwords

### 4. **Rate Limiting & Brute Force Protection**
- **Login Attempts**: Max 10 attempts per 15 minutes
- **Account Lockout**: 15-minute lockout after 5 failed attempts
- **API Rate Limiting**: 100 requests per 15 minutes per IP
- **DDoS Protection**: Request size limiting

### 5. **Security Headers (Helmet)**
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **HSTS**: Forces HTTPS connections
- **X-Frame-Options**: Prevents clickjacking
- **X-Content-Type-Options**: Prevents MIME sniffing
- **Referrer Policy**: Protects sensitive URLs

### 6. **Input Sanitization**
- **SQL Injection Prevention**: Removes dangerous characters
- **XSS Protection**: Sanitizes all user inputs
- **Length Limiting**: Prevents buffer overflow attacks
- **Type Validation**: Ensures correct data types

### 7. **Request Validation**
- **Content-Type Validation**: Rejects invalid requests
- **CORS Configuration**: Restricts cross-origin requests
- **Request Size Limiting**: Prevents memory exhaustion

## 🛡️ Security Configuration

### Environment Variables Security

**CRITICAL**: Never commit `.env` files to version control!

```bash
# Add to .gitignore
.env
.env.local
.env.production
backend/.env
```

### Generate Secure JWT Secret

```bash
# Generate a strong JWT secret (run this command)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add to your `.env`:
```
JWT_SECRET=<your-generated-secret>
```

### Encrypted Environment Variables

To encrypt sensitive environment variables:

```javascript
const { encryptEnvVars } = require('./backend/shared/encryption');

// Encrypt your env vars with a master key
const masterKey = 'your-master-key-store-securely';
const encrypted = encryptEnvVars({
  EMAIL_PASSWORD: 'your-password',
  JWT_SECRET: 'your-jwt-secret'
}, masterKey);

console.log(encrypted);
```

## 🚀 Production Deployment Checklist

### 1. **Environment Configuration**
- [ ] Change all default secrets and passwords
- [ ] Use strong JWT_SECRET (64+ random characters)
- [ ] Enable HTTPS/TLS encryption
- [ ] Set NODE_ENV=production
- [ ] Configure allowed CORS origins

### 2. **Database Security**
- [ ] Use encrypted connections to database
- [ ] Implement database backups
- [ ] Use parameterized queries (already implemented)
- [ ] Restrict database user permissions

### 3. **Server Security**
- [ ] Keep Node.js and dependencies updated
- [ ] Use a reverse proxy (nginx/Apache)
- [ ] Enable firewall (UFW/iptables)
- [ ] Use fail2ban for intrusion prevention
- [ ] Implement SSL/TLS certificates (Let's Encrypt)

### 4. **Application Security**
- [ ] Enable all security middleware
- [ ] Configure rate limiting appropriately
- [ ] Set up logging and monitoring
- [ ] Implement audit trails
- [ ] Regular security audits

### 5. **Monitoring & Logging**
- [ ] Set up centralized logging
- [ ] Monitor failed login attempts
- [ ] Track API usage patterns
- [ ] Set up alerts for suspicious activity

## 📋 Using Security Features

### In Admin Server

```javascript
const express = require('express');
const {
  securityHeaders,
  authRateLimiter,
  sanitizeInputMiddleware,
  checkLockout,
  securityLogger,
  disableCaching,
  configureCors
} = require('../shared/securityMiddleware');

const app = express();

// Apply security middleware
app.use(securityHeaders());
app.use(securityLogger);
app.use(sanitizeInputMiddleware);
app.use(configureCors(['https://your-domain.com']));

// Apply to authentication routes
app.post('/api/admin/login',
  authRateLimiter(),
  checkLockout,
  disableCaching,
  async (req, res) => {
    // Your login logic with recordFailedAttempt/resetLoginAttempts
  }
);
```

### Password Validation

```javascript
const { validatePasswordStrength } = require('./shared/security');

const validation = validatePasswordStrength(password);
if (!validation.isValid) {
  return res.status(400).json({
    error: 'Password does not meet security requirements',
    details: validation.errors
  });
}
```

### Encrypting Sensitive Data

```javascript
const { encrypt, decrypt } = require('./shared/encryption');

// Encrypt
const secret = process.env.ENCRYPTION_KEY;
const encrypted = encrypt('sensitive-data', secret);

// Decrypt
const decrypted = decrypt(encrypted, secret);
```

## 🔍 Security Testing

### 1. **Test Rate Limiting**
```bash
# Try multiple rapid requests
for i in {1..15}; do
  curl -X POST http://localhost:4000/api/admin/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"wrong"}'
done
```

### 2. **Test SQL Injection Protection**
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com'\'' OR '\''1'\''='\''1","password":"test"}'
```

### 3. **Test XSS Protection**
```bash
curl -X POST http://localhost:4000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"email":"<script>alert('\''XSS'\'')</script>","password":"test"}'
```

## 🆘 Security Incident Response

### If you suspect a breach:

1. **Immediate Actions**:
   - Rotate all secrets (JWT_SECRET, API keys)
   - Force logout all users
   - Review logs for suspicious activity
   - Lock affected accounts

2. **Investigation**:
   - Check security logs
   - Analyze database for unauthorized changes
   - Review failed login attempts

3. **Recovery**:
   - Patch vulnerabilities
   - Reset passwords for affected accounts
   - Notify users if necessary
   - Document the incident

## 📞 Support

For security concerns or questions:
- Review logs in `backend/logs/` (if enabled)
- Check console for security warnings
- Consult security documentation

## ⚠️ Important Notes

1. **Never** commit sensitive data to version control
2. **Always** use HTTPS in production
3. **Regularly** update dependencies (`npm audit`)
4. **Monitor** logs for suspicious activity
5. **Backup** your database regularly
6. **Test** security features before deployment

## 🔄 Regular Maintenance

- Update dependencies: `npm audit fix`
- Review security logs: Weekly
- Rotate secrets: Quarterly
- Security audit: Annually
- Penetration testing: Before major releases
