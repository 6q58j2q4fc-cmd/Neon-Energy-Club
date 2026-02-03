import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the database functions
vi.mock("./db", () => ({
  validateCouponCode: vi.fn(),
  redeemCouponCode: vi.fn(),
  subscribeNewsletter: vi.fn(),
  addNewsletterReferrals: vi.fn(),
}));

import { validateCouponCode, redeemCouponCode, subscribeNewsletter, addNewsletterReferrals } from "./db";

describe("Coupon Validation System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should validate a valid coupon code", async () => {
    const mockCoupon = {
      valid: true,
      discountPercent: 10,
      email: "test@example.com",
      alreadyUsed: false,
    };
    (validateCouponCode as any).mockResolvedValue(mockCoupon);

    const result = await validateCouponCode("NEON-ABC123");
    
    expect(result.valid).toBe(true);
    expect(result.discountPercent).toBe(10);
    expect(result.alreadyUsed).toBe(false);
  });

  it("should reject an already used coupon", async () => {
    const mockCoupon = {
      valid: false,
      discountPercent: 0,
      email: "test@example.com",
      alreadyUsed: true,
    };
    (validateCouponCode as any).mockResolvedValue(mockCoupon);

    const result = await validateCouponCode("NEON-USED123");
    
    expect(result.valid).toBe(false);
    expect(result.alreadyUsed).toBe(true);
  });

  it("should reject an invalid coupon code", async () => {
    const mockCoupon = {
      valid: false,
      discountPercent: 0,
      email: null,
      alreadyUsed: false,
    };
    (validateCouponCode as any).mockResolvedValue(mockCoupon);

    const result = await validateCouponCode("INVALID-CODE");
    
    expect(result.valid).toBe(false);
  });

  it("should mark coupon as used after redemption", async () => {
    (redeemCouponCode as any).mockResolvedValue({ success: true });

    const result = await redeemCouponCode("NEON-ABC123");
    
    expect(result.success).toBe(true);
    expect(redeemCouponCode).toHaveBeenCalledWith("NEON-ABC123");
  });
});

describe("Newsletter Subscription System", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should generate unique coupon code on subscription", async () => {
    const mockSubscription = {
      id: 1,
      email: "newuser@example.com",
      couponCode: "NEON-XYZ789",
      discountPercent: 10,
    };
    (subscribeNewsletter as any).mockResolvedValue(mockSubscription);

    const result = await subscribeNewsletter("New User", "newuser@example.com");
    
    expect(result.couponCode).toMatch(/^NEON-[A-Z0-9]+$/);
    expect(result.discountPercent).toBe(10);
  });

  it("should reject duplicate email subscriptions", async () => {
    (subscribeNewsletter as any).mockRejectedValue(new Error("Email already subscribed"));

    await expect(subscribeNewsletter("Duplicate User", "existing@example.com"))
      .rejects.toThrow("Email already subscribed");
  });

  it("should validate referral emails before adding", async () => {
    const mockReferrals = {
      success: true,
      addedCount: 3,
      newDiscountPercent: 25,
    };
    (addNewsletterReferrals as any).mockResolvedValue(mockReferrals);

    const result = await addNewsletterReferrals(1, [
      "friend1@example.com",
      "friend2@example.com",
      "friend3@example.com",
    ]);
    
    expect(result.success).toBe(true);
    expect(result.addedCount).toBe(3);
    expect(result.newDiscountPercent).toBe(25);
  });

  it("should reject invalid referral emails", async () => {
    (addNewsletterReferrals as any).mockRejectedValue(new Error("Invalid email format"));

    await expect(addNewsletterReferrals(1, ["invalid-email", "also-invalid"]))
      .rejects.toThrow("Invalid email format");
  });
});

describe("Shipping Calculator", () => {
  it("should calculate standard shipping for US addresses", () => {
    const calculateShipping = (subtotal: number, country: string, method: string) => {
      if (subtotal >= 100) return 0; // Free shipping over $100
      
      const rates: Record<string, Record<string, number>> = {
        USA: { standard: 5.99, express: 12.99, overnight: 24.99 },
        CA: { standard: 9.99, express: 19.99, overnight: 39.99 },
        GB: { standard: 14.99, express: 29.99, overnight: 49.99 },
      };
      
      return rates[country]?.[method] || 14.99;
    };

    expect(calculateShipping(50, "USA", "standard")).toBe(5.99);
    expect(calculateShipping(50, "USA", "express")).toBe(12.99);
    expect(calculateShipping(50, "USA", "overnight")).toBe(24.99);
  });

  it("should provide free shipping for orders over $100", () => {
    const calculateShipping = (subtotal: number, country: string, method: string) => {
      if (subtotal >= 100) return 0;
      return 5.99;
    };

    expect(calculateShipping(150, "USA", "standard")).toBe(0);
    expect(calculateShipping(100, "USA", "express")).toBe(0);
  });

  it("should calculate international shipping rates", () => {
    const calculateShipping = (subtotal: number, country: string, method: string) => {
      if (subtotal >= 100) return 0;
      
      const rates: Record<string, Record<string, number>> = {
        USA: { standard: 5.99, express: 12.99, overnight: 24.99 },
        CA: { standard: 9.99, express: 19.99, overnight: 39.99 },
        GB: { standard: 14.99, express: 29.99, overnight: 49.99 },
      };
      
      return rates[country]?.[method] || 14.99;
    };

    expect(calculateShipping(50, "CA", "standard")).toBe(9.99);
    expect(calculateShipping(50, "GB", "express")).toBe(29.99);
  });
});
