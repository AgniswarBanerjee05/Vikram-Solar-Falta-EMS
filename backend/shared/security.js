const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const JWT_SECRET = process.env.FALTA_EMS_JWT_SECRET || 'change-me-in-production';
const JWT_ISSUER = 'falta-ems';

// Encryption configuration for sensitive data at rest
const ENCRYPTION_KEY = crypto.scryptSync(
  process.env.FALTA_EMS_ENCRYPTION_KEY || JWT_SECRET,
  'falta-ems-salt',
  32
);
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

/**
 * Password hashing with bcrypt (existing - DO NOT MODIFY)
 */
async function hashPassword(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

/**
 * JWT token generation and verification (existing - DO NOT MODIFY)
 */
function generateToken(payload, { expiresIn = '2h' } = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
    issuer: JWT_ISSUER
  });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: JWT_ISSUER
  });
}

function generateTempPassword(length = 12) {
  const buffer = crypto.randomBytes(length);
  return buffer
    .toString('base64')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, length);
}

/**
 * AES-256-GCM encryption for sensitive data at rest
 * Used for encrypting sensitive database fields
 */
function encrypt(text) {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Return: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error.message);
    return text; // Fallback to plain text if encryption fails
  }
}

/**
 * Decrypt data encrypted with AES-256-GCM
 */
function decrypt(encryptedText) {
  if (!encryptedText || !encryptedText.includes(':')) return encryptedText;
  
  try {
    const parts = encryptedText.split(':');
    if (parts.length !== 3) return encryptedText;
    
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];
    
    const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error.message);
    return encryptedText; // Return as-is if decryption fails
  }
}

/**
 * Generate secure random token for CSRF protection
 */
function generateCSRFToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate secure session ID
 */
function generateSecureSessionId() {
  return crypto.randomBytes(32).toString('base64url');
}

/**
 * Hash sensitive data (one-way, for comparison only)
 */
function hashData(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function secureCompare(a, b) {
  if (!a || !b || a.length !== b.length) {
    return false;
  }
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}

/**
 * Sanitize input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  
  // Remove potentially dangerous characters
  return input
    .replace(/[<>\"'`]/g, '') // Remove HTML/JS injection chars
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim();
}

/**
 * Validate email format (basic check)
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Rate limiting helper - track attempts
 */
const rateLimitStore = new Map();

function checkRateLimit(identifier, maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const key = `ratelimit:${identifier}`;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window expired
  if (now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  // Check if limit exceeded
  if (record.count >= maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: record.resetTime 
    };
  }
  
  // Increment count
  record.count++;
  return { 
    allowed: true, 
    remaining: maxAttempts - record.count 
  };
}

/**
 * Clear rate limit for identifier (on successful login)
 */
function clearRateLimit(identifier) {
  rateLimitStore.delete(`ratelimit:${identifier}`);
}

module.exports = {
  // Existing functions (DO NOT MODIFY USAGE)
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  generateTempPassword,
  
  // New encryption functions
  encrypt,
  decrypt,
  generateCSRFToken,
  generateSecureSessionId,
  hashData,
  secureCompare,
  sanitizeInput,
  isValidEmail,
  checkRateLimit,
  clearRateLimit
};
