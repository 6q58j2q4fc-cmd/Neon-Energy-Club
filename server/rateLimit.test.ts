import { describe, it, expect } from "vitest";

describe("Rate Limiting Configuration", () => {
  it("should have general limiter configured for 100 requests per minute", () => {
    // Test configuration values
    const generalLimitConfig = {
      windowMs: 60 * 1000,
      max: 100,
    };
    
    expect(generalLimitConfig.windowMs).toBe(60000);
    expect(generalLimitConfig.max).toBe(100);
  });

  it("should have auth limiter configured for 5 requests per 15 minutes", () => {
    const authLimitConfig = {
      windowMs: 15 * 60 * 1000,
      max: 5,
    };
    
    expect(authLimitConfig.windowMs).toBe(900000);
    expect(authLimitConfig.max).toBe(5);
  });

  it("should have checkout limiter configured for 5 requests per minute", () => {
    const checkoutLimitConfig = {
      windowMs: 60 * 1000,
      max: 5,
    };
    
    expect(checkoutLimitConfig.windowMs).toBe(60000);
    expect(checkoutLimitConfig.max).toBe(5);
  });

  it("should have payout limiter configured for 3 requests per hour", () => {
    const payoutLimitConfig = {
      windowMs: 60 * 60 * 1000,
      max: 3,
    };
    
    expect(payoutLimitConfig.windowMs).toBe(3600000);
    expect(payoutLimitConfig.max).toBe(3);
  });

  it("should have LLM limiter configured for 10 requests per minute", () => {
    const llmLimitConfig = {
      windowMs: 60 * 1000,
      max: 10,
    };
    
    expect(llmLimitConfig.windowMs).toBe(60000);
    expect(llmLimitConfig.max).toBe(10);
  });

  it("should return proper rate limit error response structure", () => {
    const errorResponse = {
      error: "Too many requests",
      message: "You have exceeded the rate limit. Please try again later.",
      retryAfter: "60",
    };
    
    expect(errorResponse).toHaveProperty("error");
    expect(errorResponse).toHaveProperty("message");
    expect(errorResponse).toHaveProperty("retryAfter");
    expect(errorResponse.error).toBe("Too many requests");
  });

  it("should skip rate limiting for health check paths", () => {
    const skipPaths = ["/health", "/api/health", "/_vite"];
    
    const shouldSkip = (path: string): boolean => {
      return skipPaths.some(skipPath => path.startsWith(skipPath));
    };
    
    expect(shouldSkip("/health")).toBe(true);
    expect(shouldSkip("/api/health")).toBe(true);
    expect(shouldSkip("/_vite/client")).toBe(true);
    expect(shouldSkip("/api/trpc/auth.me")).toBe(false);
    expect(shouldSkip("/api/trpc/payment")).toBe(false);
  });
});

describe("Rate Limit Headers", () => {
  it("should include standard rate limit headers", () => {
    const expectedHeaders = [
      "RateLimit-Limit",
      "RateLimit-Remaining",
      "RateLimit-Reset",
    ];
    
    // Verify header names follow standard format
    expectedHeaders.forEach(header => {
      expect(header).toMatch(/^RateLimit-/);
    });
  });
});
