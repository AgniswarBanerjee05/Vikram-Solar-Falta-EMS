const helmet = require('helmet');
const { checkRateLimit, sanitizeInput } = require('./security');

/**
 * Security headers middleware using helmet
 */
function securityHeaders() {
  return helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    },
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    noSniff: true,
    xssFilter: true,
    hidePoweredBy: true
  });
}

/**
 * Rate limiting middleware
 * Prevents brute force attacks
 */
function rateLimitMiddleware(maxAttempts = 100, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    // Use IP address as identifier
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    
    const result = checkRateLimit(identifier, maxAttempts, windowMs);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.set('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter
      });
    }
    
    // Add rate limit info to headers
    res.set('X-RateLimit-Remaining', result.remaining);
    
    next();
  };
}

/**
 * Strict rate limiting for authentication endpoints
 * More restrictive to prevent brute force login attempts
 */
function authRateLimitMiddleware(maxAttempts = 5, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    // Use email + IP for auth endpoints
    const email = req.body?.email || req.body?.username || 'unknown';
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const identifier = `auth:${email}:${ip}`;
    
    const result = checkRateLimit(identifier, maxAttempts, windowMs);
    
    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
      res.set('Retry-After', retryAfter);
      return res.status(429).json({
        error: 'Too many login attempts',
        message: 'Account temporarily locked. Please try again later.',
        retryAfter
      });
    }
    
    res.set('X-RateLimit-Remaining', result.remaining);
    next();
  };
}

/**
 * Input sanitization middleware
 * Sanitizes all string inputs in request body
 */
function sanitizeInputMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      // Don't sanitize password fields (they should remain as-is for bcrypt)
      if (key.toLowerCase().includes('password')) {
        return;
      }
      
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeInput(req.body[key]);
      }
    });
  }
  
  next();
}

/**
 * Request validation middleware
 * Validates Content-Type for POST/PUT requests
 */
function validateContentType(req, res, next) {
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.get('Content-Type');
    
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(400).json({
        error: 'Invalid Content-Type',
        message: 'Content-Type must be application/json'
      });
    }
  }
  
  next();
}

/**
 * Request size limiting
 */
function requestSizeLimit(maxSizeKB = 100) {
  return (req, res, next) => {
    const contentLength = parseInt(req.get('Content-Length') || '0');
    const maxBytes = maxSizeKB * 1024;
    
    if (contentLength > maxBytes) {
      return res.status(413).json({
        error: 'Payload too large',
        message: `Request body must be less than ${maxSizeKB}KB`
      });
    }
    
    next();
  };
}

/**
 * Security logging middleware
 * Logs suspicious activities
 */
function securityLogger(req, res, next) {
  const timestamp = new Date().toISOString();
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'unknown';
  
  // Log all authentication attempts
  if (req.path.includes('/login') || req.path.includes('/register')) {
    console.log(`[SECURITY] ${timestamp} - ${req.method} ${req.path} - IP: ${ip} - UA: ${userAgent}`);
  }
  
  // Log suspicious activities
  const suspiciousPatterns = [
    /\.\.\//,  // Path traversal
    /<script/i,  // XSS attempts
    /union.*select/i,  // SQL injection
    /javascript:/i,  // JS injection
    /on\w+=/i  // Event handler injection
  ];
  
  const requestString = JSON.stringify(req.body) + JSON.stringify(req.query);
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));
  
  if (isSuspicious) {
    console.warn(`[SECURITY ALERT] ${timestamp} - Suspicious request detected - IP: ${ip} - Path: ${req.path}`);
  }
  
  next();
}

/**
 * CORS security enhancement
 * More strict CORS with credentials support
 */
function secureCORS(allowedOrigins) {
  return (req, res, next) => {
    const origin = req.get('Origin');
    
    // Check if origin is allowed
    if (origin && allowedOrigins.includes(origin)) {
      res.set('Access-Control-Allow-Origin', origin);
      res.set('Access-Control-Allow-Credentials', 'true');
      res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.set('Access-Control-Max-Age', '86400'); // 24 hours
    }
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }
    
    next();
  };
}

module.exports = {
  securityHeaders,
  rateLimitMiddleware,
  authRateLimitMiddleware,
  sanitizeInputMiddleware,
  validateContentType,
  requestSizeLimit,
  securityLogger,
  secureCORS
};
