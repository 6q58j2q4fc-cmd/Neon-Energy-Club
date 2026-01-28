/**
 * Rate Limiting Middleware
 * Protects API endpoints from abuse with configurable limits
 */

import rateLimit from "express-rate-limit";
import type { Request, Response } from "express";

// Custom handler for rate limit exceeded
const rateLimitHandler = (req: Request, res: Response) => {
  res.status(429).json({
    error: "Too many requests",
    message: "You have exceeded the rate limit. Please try again later.",
    retryAfter: res.getHeader("Retry-After"),
  });
};

// Skip rate limiting for certain paths (health checks, static assets)
const skipPaths = ["/health", "/api/health", "/_vite"];
const shouldSkip = (req: Request): boolean => {
  return skipPaths.some(path => req.path.startsWith(path));
};

/**
 * General API rate limiter
 * 100 requests per minute for general API access
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  standardHeaders: true, // Return rate limit info in headers
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: shouldSkip,
  message: "Too many requests from this IP, please try again after a minute",
});

/**
 * Strict rate limiter for sensitive endpoints
 * 10 requests per minute for auth, checkout, payout requests
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  message: "Too many requests to this endpoint, please try again after a minute",
});

/**
 * Auth rate limiter
 * 5 requests per 15 minutes for login/signup attempts
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many authentication attempts",
      message: "You have exceeded the authentication rate limit. Please try again in 15 minutes.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
  message: "Too many authentication attempts, please try again after 15 minutes",
});

/**
 * Checkout rate limiter
 * 5 requests per minute for checkout/payment endpoints
 */
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 checkout attempts per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many checkout attempts",
      message: "Please wait before attempting another checkout.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
  message: "Too many checkout attempts, please try again after a minute",
});

/**
 * Payout request rate limiter
 * 3 requests per hour for payout requests
 */
export const payoutLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 payout requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many payout requests",
      message: "You can only request payouts 3 times per hour. Please try again later.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
  message: "Too many payout requests, please try again after an hour",
});

/**
 * Newsletter/signup rate limiter
 * 10 requests per hour for newsletter signups
 */
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 signups per hour
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "Too many signup attempts",
      message: "Please wait before attempting to sign up again.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
  message: "Too many signup attempts, please try again later",
});

/**
 * LLM/AI endpoint rate limiter
 * 10 requests per minute for AI-powered features
 */
export const llmLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: "AI rate limit exceeded",
      message: "You have exceeded the AI feature rate limit. Please try again in a minute.",
      retryAfter: res.getHeader("Retry-After"),
    });
  },
  message: "Too many AI requests, please try again after a minute",
});

/**
 * Export all limiters for use in routes
 */
export const rateLimiters = {
  general: generalLimiter,
  strict: strictLimiter,
  auth: authLimiter,
  checkout: checkoutLimiter,
  payout: payoutLimiter,
  signup: signupLimiter,
  llm: llmLimiter,
};
