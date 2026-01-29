/**
 * NEON Energy Security Bot
 * 
 * LLM-powered security monitoring system that:
 * - Monitors for suspicious activity patterns
 * - Detects potential data breaches or interference
 * - Encrypts sensitive data with AES-256
 * - Rate limits suspicious IPs
 * - Validates request integrity
 * - Protects against SQL injection, XSS, and other attacks
 */

import crypto from "crypto";
// Security bot - no direct db import needed
import { invokeLLM } from "./_core/llm";

// Encryption key derived from JWT_SECRET (use env variable in production)
const ENCRYPTION_KEY = process.env.JWT_SECRET 
  ? crypto.createHash('sha256').update(process.env.JWT_SECRET).digest()
  : crypto.randomBytes(32);

const IV_LENGTH = 16;

// Security event types
type SecurityEventType = 
  | 'suspicious_request'
  | 'rate_limit_exceeded'
  | 'sql_injection_attempt'
  | 'xss_attempt'
  | 'brute_force_attempt'
  | 'data_exfiltration_attempt'
  | 'unauthorized_access'
  | 'anomaly_detected';

interface SecurityEvent {
  type: SecurityEventType;
  ip: string;
  userAgent?: string;
  path?: string;
  payload?: string;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  blocked: boolean;
}

// In-memory security state (use Redis in production)
const securityState = {
  blockedIPs: new Set<string>(),
  rateLimitMap: new Map<string, { count: number; firstRequest: Date }>(),
  securityEvents: [] as SecurityEvent[],
  suspiciousPatterns: new Map<string, number>(),
};

// Rate limiting configuration
const RATE_LIMIT = {
  windowMs: 60000, // 1 minute
  maxRequests: 100, // max requests per window
  blockDuration: 300000, // 5 minutes block
};

/**
 * AES-256-CBC Encryption
 * Encrypts sensitive data before storage
 */
export function encryptData(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * AES-256-CBC Decryption
 * Decrypts sensitive data for authorized access
 */
export function decryptData(encryptedText: string): string {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedData = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Hash sensitive data for comparison without storing plaintext
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * Detect SQL injection patterns
 */
function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE)\b)/gi,
    /(\b(OR|AND)\b\s+\d+\s*=\s*\d+)/gi,
    /(--|\#|\/\*|\*\/)/g,
    /(\b(EXEC|EXECUTE|xp_|sp_)\b)/gi,
    /(;|\||\$\(|\`)/g,
    /(\bWAITFOR\b\s+\bDELAY\b)/gi,
    /(\bBENCHMARK\b\s*\()/gi,
  ];
  
  return sqlPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect XSS patterns
 */
function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^>]*>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
    /eval\s*\(/gi,
    /document\.(cookie|write|location)/gi,
    /window\.(location|open)/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
}

/**
 * Detect path traversal attempts
 */
function detectPathTraversal(input: string): boolean {
  const patterns = [
    /\.\.\//g,
    /\.\.%2f/gi,
    /%2e%2e%2f/gi,
    /\.\.%5c/gi,
    /%2e%2e%5c/gi,
  ];
  
  return patterns.some(pattern => pattern.test(input));
}

/**
 * Check if IP is blocked
 */
export function isIPBlocked(ip: string): boolean {
  return securityState.blockedIPs.has(ip);
}

/**
 * Block an IP address
 */
export function blockIP(ip: string, duration: number = RATE_LIMIT.blockDuration): void {
  securityState.blockedIPs.add(ip);
  setTimeout(() => {
    securityState.blockedIPs.delete(ip);
  }, duration);
}

/**
 * Check rate limit for IP
 */
export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = new Date();
  const record = securityState.rateLimitMap.get(ip);
  
  if (!record) {
    securityState.rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  const elapsed = now.getTime() - record.firstRequest.getTime();
  
  if (elapsed > RATE_LIMIT.windowMs) {
    // Reset window
    securityState.rateLimitMap.set(ip, { count: 1, firstRequest: now });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  record.count++;
  
  if (record.count > RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - record.count };
}

/**
 * Log security event
 */
function logSecurityEvent(event: SecurityEvent): void {
  securityState.securityEvents.push(event);
  
  // Keep only last 1000 events in memory
  if (securityState.securityEvents.length > 1000) {
    securityState.securityEvents = securityState.securityEvents.slice(-500);
  }
  
  // Log critical events
  if (event.severity === 'critical' || event.severity === 'high') {
    console.error(`[SECURITY] ${event.type} from ${event.ip}: ${event.payload?.substring(0, 100)}`);
  }
}

/**
 * Validate and sanitize request
 * Returns sanitized data or throws if malicious
 */
export function validateRequest(
  ip: string,
  path: string,
  body: any,
  userAgent?: string
): { valid: boolean; sanitized: any; blocked: boolean; reason?: string } {
  // Check if IP is blocked
  if (isIPBlocked(ip)) {
    return { valid: false, sanitized: null, blocked: true, reason: 'IP blocked' };
  }
  
  // Check rate limit
  const rateLimit = checkRateLimit(ip);
  if (!rateLimit.allowed) {
    blockIP(ip);
    logSecurityEvent({
      type: 'rate_limit_exceeded',
      ip,
      userAgent,
      path,
      timestamp: new Date(),
      severity: 'medium',
      blocked: true,
    });
    return { valid: false, sanitized: null, blocked: true, reason: 'Rate limit exceeded' };
  }
  
  // Convert body to string for pattern checking
  const bodyStr = typeof body === 'string' ? body : JSON.stringify(body);
  
  // Check for SQL injection
  if (detectSQLInjection(bodyStr)) {
    logSecurityEvent({
      type: 'sql_injection_attempt',
      ip,
      userAgent,
      path,
      payload: bodyStr.substring(0, 500),
      timestamp: new Date(),
      severity: 'high',
      blocked: true,
    });
    
    // Track suspicious pattern
    const count = (securityState.suspiciousPatterns.get(ip) || 0) + 1;
    securityState.suspiciousPatterns.set(ip, count);
    
    if (count >= 3) {
      blockIP(ip, 3600000); // Block for 1 hour after 3 attempts
    }
    
    return { valid: false, sanitized: null, blocked: true, reason: 'SQL injection detected' };
  }
  
  // Check for XSS
  if (detectXSS(bodyStr)) {
    logSecurityEvent({
      type: 'xss_attempt',
      ip,
      userAgent,
      path,
      payload: bodyStr.substring(0, 500),
      timestamp: new Date(),
      severity: 'high',
      blocked: true,
    });
    
    return { valid: false, sanitized: null, blocked: true, reason: 'XSS detected' };
  }
  
  // Check for path traversal
  if (detectPathTraversal(path)) {
    logSecurityEvent({
      type: 'suspicious_request',
      ip,
      userAgent,
      path,
      timestamp: new Date(),
      severity: 'medium',
      blocked: true,
    });
    
    return { valid: false, sanitized: null, blocked: true, reason: 'Path traversal detected' };
  }
  
  // Sanitize the body
  const sanitized = sanitizeInput(body);
  
  return { valid: true, sanitized, blocked: false };
}

/**
 * Sanitize input recursively
 */
function sanitizeInput(input: any): any {
  if (typeof input === 'string') {
    // Remove potential XSS vectors
    return input
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key)] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

/**
 * LLM-powered anomaly detection
 * Analyzes patterns to detect sophisticated attacks
 */
export async function analyzeSecurityAnomaly(
  events: SecurityEvent[]
): Promise<{
  threatLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  analysis: string;
  recommendations: string[];
  shouldAlert: boolean;
}> {
  if (events.length === 0) {
    return {
      threatLevel: 'none',
      analysis: 'No security events to analyze',
      recommendations: [],
      shouldAlert: false,
    };
  }
  
  const eventSummary = events.slice(-50).map(e => ({
    type: e.type,
    ip: e.ip,
    path: e.path,
    severity: e.severity,
    time: e.timestamp.toISOString(),
  }));
  
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: 'system',
          content: `You are a cybersecurity analyst AI. Analyze the following security events and provide:
1. Overall threat level (none, low, medium, high, critical)
2. Brief analysis of patterns
3. Specific recommendations
4. Whether to alert the administrator

Respond in JSON format:
{
  "threatLevel": "string",
  "analysis": "string",
  "recommendations": ["string"],
  "shouldAlert": boolean
}`
        },
        {
          role: 'user',
          content: `Analyze these security events:\n${JSON.stringify(eventSummary, null, 2)}`
        }
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'security_analysis',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              threatLevel: { type: 'string', enum: ['none', 'low', 'medium', 'high', 'critical'] },
              analysis: { type: 'string' },
              recommendations: { type: 'array', items: { type: 'string' } },
              shouldAlert: { type: 'boolean' }
            },
            required: ['threatLevel', 'analysis', 'recommendations', 'shouldAlert'],
            additionalProperties: false
          }
        }
      }
    });
    
    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : '{}');
    return result;
  } catch (error) {
    console.error('[Security Bot] LLM analysis failed:', error);
    return {
      threatLevel: events.some(e => e.severity === 'critical') ? 'high' : 'medium',
      analysis: 'Automated analysis unavailable, manual review recommended',
      recommendations: ['Review security logs manually', 'Check for unusual patterns'],
      shouldAlert: events.some(e => e.severity === 'critical' || e.severity === 'high'),
    };
  }
}

/**
 * Get security dashboard data
 */
export function getSecurityDashboard(): {
  blockedIPs: number;
  recentEvents: SecurityEvent[];
  eventsByType: Record<string, number>;
  threatLevel: string;
} {
  const recentEvents = securityState.securityEvents.slice(-100);
  
  const eventsByType: Record<string, number> = {};
  for (const event of recentEvents) {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
  }
  
  // Calculate overall threat level
  const criticalCount = recentEvents.filter(e => e.severity === 'critical').length;
  const highCount = recentEvents.filter(e => e.severity === 'high').length;
  
  let threatLevel = 'low';
  if (criticalCount > 0) threatLevel = 'critical';
  else if (highCount > 5) threatLevel = 'high';
  else if (highCount > 0) threatLevel = 'medium';
  
  return {
    blockedIPs: securityState.blockedIPs.size,
    recentEvents: recentEvents.slice(-20),
    eventsByType,
    threatLevel,
  };
}

/**
 * Encrypt sensitive user data for storage
 */
export function encryptUserData(userData: {
  email?: string;
  phone?: string;
  ssn?: string;
  bankAccount?: string;
}): {
  email?: string;
  phone?: string;
  ssn?: string;
  bankAccount?: string;
  emailHash?: string;
} {
  const encrypted: any = {};
  
  if (userData.email) {
    encrypted.email = encryptData(userData.email);
    encrypted.emailHash = hashData(userData.email.toLowerCase());
  }
  if (userData.phone) {
    encrypted.phone = encryptData(userData.phone);
  }
  if (userData.ssn) {
    encrypted.ssn = encryptData(userData.ssn);
  }
  if (userData.bankAccount) {
    encrypted.bankAccount = encryptData(userData.bankAccount);
  }
  
  return encrypted;
}

/**
 * Verify request signature for API calls
 */
export function verifyRequestSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return generateSecureToken(32);
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string, storedToken: string): boolean {
  if (!token || !storedToken) return false;
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(storedToken)
  );
}

// Export security middleware
export const securityMiddleware = {
  validateRequest,
  checkRateLimit,
  isIPBlocked,
  blockIP,
  encryptData,
  decryptData,
  hashData,
  generateSecureToken,
  analyzeSecurityAnomaly,
  getSecurityDashboard,
  encryptUserData,
  verifyRequestSignature,
  generateCSRFToken,
  validateCSRFToken,
};

export default securityMiddleware;
