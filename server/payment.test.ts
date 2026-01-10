import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the stripe module
vi.mock("./stripe", () => ({
  isStripeConfigured: vi.fn().mockReturnValue(false), // Default to not configured
  createCrowdfundingCheckout: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
  createFranchiseCheckout: vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/test" }),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: { host: "example.com" },
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("payment.isConfigured", () => {
  it("returns Stripe configuration status", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.payment.isConfigured();

    expect(result).toHaveProperty("configured");
    expect(typeof result.configured).toBe("boolean");
  });
});

describe("payment.createCrowdfundingCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws error when Stripe is not configured", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createCrowdfundingCheckout({
        amount: 10000,
        tierName: "ENERGIZER",
        name: "Test User",
        email: "test@example.com",
      })
    ).rejects.toThrow("Stripe is not configured");
  });

  it("validates minimum amount", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createCrowdfundingCheckout({
        amount: 50, // Below minimum of 100
        tierName: "SUPPORTER",
        name: "Test User",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("validates email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createCrowdfundingCheckout({
        amount: 10000,
        tierName: "ENERGIZER",
        name: "Test User",
        email: "invalid-email",
      })
    ).rejects.toThrow();
  });
});

describe("payment.createFranchiseCheckout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws error when Stripe is not configured", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createFranchiseCheckout({
        depositAmount: 36000,
        totalCost: 180000,
        territory: "Los Angeles, CA",
        squareMiles: 100,
        termMonths: 12,
        name: "Test User",
        email: "test@example.com",
      })
    ).rejects.toThrow("Stripe is not configured");
  });

  it("validates minimum square miles", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createFranchiseCheckout({
        depositAmount: 1000,
        totalCost: 5000,
        territory: "Small Area",
        squareMiles: 5, // Below minimum of 10
        termMonths: 12,
        name: "Test User",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("validates minimum term months", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createFranchiseCheckout({
        depositAmount: 1000,
        totalCost: 5000,
        territory: "Test Area",
        squareMiles: 50,
        termMonths: 3, // Below minimum of 6
        name: "Test User",
        email: "test@example.com",
      })
    ).rejects.toThrow();
  });

  it("validates email format", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.payment.createFranchiseCheckout({
        depositAmount: 36000,
        totalCost: 180000,
        territory: "Los Angeles, CA",
        squareMiles: 100,
        termMonths: 12,
        name: "Test User",
        email: "not-an-email",
      })
    ).rejects.toThrow();
  });
});
