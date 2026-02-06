import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the notification module
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock the database module
vi.mock("./db", () => ({
  createTerritoryLicense: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAllTerritoryLicenses: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Test User",
      email: "test@example.com",
      territory: "Los Angeles, CA",
      squareMiles: 100,
      termMonths: 12,
      pricePerSqMile: 150,
      totalCost: 180000,
      financing: "full",
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  ]),
  updateTerritoryLicenseStatus: vi.fn().mockResolvedValue(undefined),
  createCrowdfundingContribution: vi.fn().mockResolvedValue({ insertId: 1 }),
  getAllCrowdfundingContributions: vi.fn().mockResolvedValue([
    {
      id: 1,
      name: "Backer Name",
      email: "backer@example.com",
      amount: 100,
      rewardTier: "ENERGIZER",
      status: "completed",
      createdAt: new Date().toISOString(),
    },
  ]),
  getCrowdfundingStats: vi.fn().mockResolvedValue({
    totalAmount: 487350,
    totalBackers: 2847,
  }),
  updateCrowdfundingStatus: vi.fn().mockResolvedValue(undefined),
}));

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastSignedIn: new Date().toISOString(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("franchise.submit", () => {
  it("creates a franchise application successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.franchise.submit({
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      territory: "Los Angeles, CA",
      squareMiles: 100,
      termMonths: 12,
      pricePerSqMile: 150,
      totalCost: 180000,
      financing: "full",
      notes: "Interested in downtown area",
    });

    expect(result).toEqual({ success: true });
  });

  it("validates minimum square miles", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.franchise.submit({
        name: "John Doe",
        email: "john@example.com",
        territory: "Small Area",
        squareMiles: 5, // Below minimum of 10
        termMonths: 12,
        pricePerSqMile: 150,
        totalCost: 9000,
        financing: "full",
      })
    ).rejects.toThrow();
  });
});

describe("franchise.list", () => {
  it("allows admin to list all franchise applications", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.franchise.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("territory");
  });

  it("denies non-admin users from listing applications", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.franchise.list()).rejects.toThrow("Unauthorized");
  });
});

describe("crowdfunding.submit", () => {
  it("creates a crowdfunding contribution successfully", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crowdfunding.submit({
      name: "Jane Backer",
      email: "jane@example.com",
      amount: 100,
      rewardTier: "ENERGIZER",
      message: "Excited for the relaunch!",
    });

    expect(result).toEqual({ success: true });
  });

  it("validates minimum contribution amount", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.crowdfunding.submit({
        name: "Jane Backer",
        email: "jane@example.com",
        amount: 0, // Below minimum of 1
        rewardTier: "SUPPORTER",
      })
    ).rejects.toThrow();
  });
});

describe("crowdfunding.stats", () => {
  it("returns campaign statistics", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crowdfunding.stats();

    expect(result).toHaveProperty("totalRaised");
    expect(result).toHaveProperty("totalBackers");
    expect(result).toHaveProperty("goal");
    expect(result).toHaveProperty("daysLeft");
    expect(result.goal).toBe(1000000);
  });
});

describe("crowdfunding.list", () => {
  it("allows admin to list all contributions", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.crowdfunding.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("denies non-admin users from listing contributions", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.crowdfunding.list()).rejects.toThrow("Unauthorized");
  });
});
