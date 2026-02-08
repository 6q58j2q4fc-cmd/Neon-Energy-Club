/**
 * Comprehensive Security Module for NEON Energy Drink Website
 * 
 * This module implements multiple layers of security:
 * 1. Rate limiting to prevent DDoS and brute force attacks
 * 2. Input sanitization to prevent XSS and SQL injection
 * 3. Security headers for browser protection
 * 4. Request validation and suspicious activity detection
 * 5. IP blocking for known malicious actors
 * 6. CSRF protection
 * 7. Content Security Policy (CSP)
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// ============================================
// RATE LIMITING
// ============================================

interface RateLimitEntry {
  count: number;
  firstRequest: number;
  blocked: boolean;
  blockUntil?: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  rateLimitStore.forEach((entry, key) => {
    if (now - entry.firstRequest > 3600000) { // 1 hour
      rateLimitStore.delete(key);
    }
  });
}, 300000);

export function rateLimit(options: {
  windowMs?: number;
  maxRequests?: number;
  blockDurationMs?: number;
} = {}) {
  const {
    windowMs = 60000, // 1 minute window
    maxRequests = 100, // 100 requests per window
    blockDurationMs = 300000, // 5 minute block
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = getClientIP(req);
    const now = Date.now();
    
    let entry = rateLimitStore.get(clientIP);
    
    // Check if blocked
    if (entry?.blocked && entry.blockUntil && now < entry.blockUntil) {
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((entry.blockUntil - now) / 1000),
      });
      return;
    }
    
    // Reset if window expired or block expired
    if (!entry || now - entry.firstRequest > windowMs || (entry.blocked && entry.blockUntil && now >= entry.blockUntil)) {
      entry = { count: 1, firstRequest: now, blocked: false };
      rateLimitStore.set(clientIP, entry);
      next();
      return;
    }
    
    entry.count++;
    
    // Block if exceeded
    if (entry.count > maxRequests) {
      entry.blocked = true;
      entry.blockUntil = now + blockDurationMs;
      console.warn(`[Security] Rate limit exceeded for IP: ${clientIP}`);
      res.status(429).json({
        error: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(blockDurationMs / 1000),
      });
      return;
    }
    
    next();
  };
}

// ============================================
// SECURITY HEADERS
// ============================================

export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // Generate nonce for inline scripts
    const nonce = crypto.randomBytes(16).toString('base64');
    res.locals.cspNonce = nonce;
    
    // Strict Transport Security - Force HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    
    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // XSS Protection (legacy browsers)
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Referrer Policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Permissions Policy (formerly Feature Policy) - Comprehensive OWASP-compliant directives
    res.setHeader('Permissions-Policy', [
      'accelerometer=()',
      'ambient-light-sensor=()',
      'autoplay=()',
      'battery=()',
      'camera=()',
      'display-capture=()',
      'document-domain=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=()',
      'screen-wake-lock=()',
      'sync-xhr=()',
      'usb=()',
      'web-share=()',
      'xr-spatial-tracking=()',
    ].join(', '));
    
    // Content Security Policy
    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://files.manuscdn.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
      `img-src 'self' data: blob: https: http:`,
      `font-src 'self' https://fonts.gstatic.com data:`,
      `connect-src 'self' https: wss:`,
      `media-src 'self' https: blob:`,
      `frame-src 'self' https://www.youtube.com https://player.vimeo.com`,
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; ');
    
    res.setHeader('Content-Security-Policy', csp);
    
    // Remove server identification
    res.removeHeader('X-Powered-By');
    
    next();
  };
}

// ============================================
// INPUT SANITIZATION
// ============================================

const DANGEROUS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /data:text\/html/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /vbscript:/gi,
];

const SQL_INJECTION_PATTERNS = [
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE|EXEC|UNION|DECLARE)\b)/gi,
  /(--|#|\/\*|\*\/)/g,
  /(\bOR\b\s+\d+\s*=\s*\d+)/gi,
  /(\bAND\b\s+\d+\s*=\s*\d+)/gi,
  /(;|\|\||&&)/g,
];

export function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    let sanitized = input;
    
    // Check for dangerous patterns
    for (const pattern of DANGEROUS_PATTERNS) {
      sanitized = sanitized.replace(pattern, '');
    }
    
    // HTML encode special characters
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    return sanitized;
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (input && typeof input === 'object') {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

export function detectSQLInjection(input: string): boolean {
  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

// ============================================
// SUSPICIOUS ACTIVITY DETECTION
// ============================================

interface SuspiciousActivity {
  ip: string;
  reason: string;
  timestamp: number;
  path: string;
  userAgent?: string;
}

const suspiciousActivities: SuspiciousActivity[] = [];
const blockedIPs = new Set<string>();

// Known malicious user agents
const MALICIOUS_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /nmap/i,
  /masscan/i,
  /zgrab/i,
  /gobuster/i,
  /dirbuster/i,
  /wpscan/i,
  /acunetix/i,
  /nessus/i,
  /openvas/i,
  /burpsuite/i,
];

// Suspicious paths that indicate scanning
const SUSPICIOUS_PATHS = [
  /\.env/i,
  /\.git/i,
  /wp-admin/i,
  /wp-login/i,
  /phpmyadmin/i,
  /admin\.php/i,
  /shell\.php/i,
  /config\.php/i,
  /\.sql$/i,
  /\.bak$/i,
  /\.backup$/i,
  /\.old$/i,
  /\.swp$/i,
  /\.DS_Store/i,
];

export function detectSuspiciousActivity() {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = getClientIP(req);
    const userAgent = req.headers['user-agent'] || '';
    const path = req.path;
    
    // Check if IP is blocked
    if (blockedIPs.has(clientIP)) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    let suspicious = false;
    let reason = '';
    
    // Check for malicious user agents
    for (const pattern of MALICIOUS_USER_AGENTS) {
      if (pattern.test(userAgent)) {
        suspicious = true;
        reason = `Malicious user agent: ${userAgent}`;
        break;
      }
    }
    
    // Check for suspicious paths
    if (!suspicious) {
      for (const pattern of SUSPICIOUS_PATHS) {
        if (pattern.test(path)) {
          suspicious = true;
          reason = `Suspicious path access: ${path}`;
          break;
        }
      }
    }
    
    // Check for SQL injection in query params
    if (!suspicious) {
      const queryString = JSON.stringify(req.query);
      if (detectSQLInjection(queryString)) {
        suspicious = true;
        reason = 'Potential SQL injection attempt';
      }
    }
    
    // Log suspicious activity
    if (suspicious) {
      const activity: SuspiciousActivity = {
        ip: clientIP,
        reason,
        timestamp: Date.now(),
        path,
        userAgent,
      };
      
      suspiciousActivities.push(activity);
      console.warn(`[Security] Suspicious activity detected:`, activity);
      
      // Count recent suspicious activities from this IP
      const recentCount = suspiciousActivities.filter(
        a => a.ip === clientIP && Date.now() - a.timestamp < 3600000
      ).length;
      
      // Block IP if too many suspicious activities
      if (recentCount >= 5) {
        blockedIPs.add(clientIP);
        console.warn(`[Security] IP blocked due to repeated suspicious activity: ${clientIP}`);
      }
      
      res.status(403).json({ error: 'Access denied' });
      return;
    }
    
    next();
  };
}

// ============================================
// CSRF PROTECTION
// ============================================

const csrfTokens = new Map<string, { token: string; expires: number }>();

export function generateCSRFToken(sessionId: string): string {
  const token = crypto.randomBytes(32).toString('hex');
  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 3600000, // 1 hour
  });
  return token;
}

export function validateCSRFToken(sessionId: string, token: string): boolean {
  const stored = csrfTokens.get(sessionId);
  if (!stored) return false;
  if (Date.now() > stored.expires) {
    csrfTokens.delete(sessionId);
    return false;
  }
  return stored.token === token;
}

// Clean up expired tokens
setInterval(() => {
  const now = Date.now();
  csrfTokens.forEach((value, key) => {
    if (now > value.expires) {
      csrfTokens.delete(key);
    }
  });
}, 300000);

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getClientIP(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded : forwarded[0];
    return ips.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

// ============================================
// OBFUSCATION HELPERS
// ============================================

// Prevent source code viewing through browser dev tools
export function antiDebug() {
  return `
    (function() {
      const devtools = { open: false };
      const threshold = 160;
      
      setInterval(function() {
        if (window.outerWidth - window.innerWidth > threshold || 
            window.outerHeight - window.innerHeight > threshold) {
          devtools.open = true;
        } else {
          devtools.open = false;
        }
      }, 500);
      
      // Disable right-click context menu
      document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
      });
      
      // Disable keyboard shortcuts for dev tools
      document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
            (e.ctrlKey && e.key === 'U')) {
          e.preventDefault();
        }
      });
    })();
  `;
}

// ============================================
// EXPORT COMBINED MIDDLEWARE
// ============================================

export function applySecurity(app: any) {
  // Apply security headers to all requests
  app.use(securityHeaders());
  
  // Apply rate limiting
  app.use(rateLimit({
    windowMs: 60000,
    maxRequests: 100,
    blockDurationMs: 300000,
  }));
  
  // Stricter rate limiting for auth endpoints
  app.use('/api/trpc/auth', rateLimit({
    windowMs: 60000,
    maxRequests: 10,
    blockDurationMs: 900000, // 15 minutes
  }));
  
  // Detect suspicious activity
  app.use(detectSuspiciousActivity());
  
  console.log('[Security] Security middleware applied');
}
