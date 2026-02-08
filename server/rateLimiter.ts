/**
 * Rate Limiting Middleware for API Security
 * 
 * Prevents abuse by limiting request rates per IP/user
 */

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Max requests per window
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const store: RateLimitStore = {};

/**
 * Clean up expired entries periodically
 */
setInterval(() => {
  const now = Date.now();
  for (const key in store) {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  }
}, 60000); // Clean every minute

/**
 * Rate limiter factory
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; remaining: number; resetTime: number } => {
    const now = Date.now();
    const entry = store[identifier];
    
    // Initialize or reset if window expired
    if (!entry || entry.resetTime < now) {
      store[identifier] = {
        count: 1,
        resetTime: now + config.windowMs
      };
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: store[identifier].resetTime
      };
    }
    
    // Increment count
    entry.count++;
    
    // Check if limit exceeded
    if (entry.count > config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }
    
    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  };
}

/**
 * Pre-configured rate limiters for different endpoints
 */
export const rateLimiters = {
  // Strict limit for authentication endpoints
  auth: createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    message: "Too many login attempts, please try again later"
  }),
  
  // Moderate limit for commission/financial endpoints
  financial: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 10,
    message: "Too many requests to financial endpoints"
  }),
  
  // Generous limit for general API calls
  general: createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    message: "Rate limit exceeded"
  }),
  
  // Very strict for enrollment/signup
  enrollment: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3,
    message: "Too many enrollment attempts"
  })
};

/**
 * Get client identifier from request
 */
export function getClientIdentifier(req: any): string {
  // Try to get user ID if authenticated
  if (req.user?.id) {
    return `user:${req.user.id}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded ? forwarded.split(',')[0] : req.socket.remoteAddress;
  return `ip:${ip}`;
}
