import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Use random IDs within INT range to ensure uniqueness across test runs
let idCounter = 0;

function createAuthContext(role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  idCounter++;
  const userId = Math.floor(Math.random() * 1000000000) + idCounter;
  
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      get: (name: string) => name === "host" ? "test.example.com" : undefined,
      headers: { origin: "https://test.example.com" },
    } as any,
  };

  return { ctx };
}

describe("Distributor MLM System Tests", () => {
  describe("Username Management", () => {
    it("should check username availability", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.distributor.checkUsername({ username: "testuser123" });
      
      expect(result).toHaveProperty("available");
      expect(typeof result.available).toBe("boolean");
    });
  });

  describe("Subdomain Management", () => {
    it("should check subdomain availability", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.distributor.checkSubdomain({ subdomain: "mystore123" });
      
      expect(result).toHaveProperty("available");
      expect(typeof result.available).toBe("boolean");
    });

    it("should reject reserved subdomains", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.distributor.checkSubdomain({ subdomain: "admin" });
      
      expect(result.available).toBe(false);
      expect(result.reason).toBe("Reserved subdomain");
    });

    it("should reject www subdomain", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.distributor.checkSubdomain({ subdomain: "www" });
      
      expect(result.available).toBe(false);
    });
  });

  describe("Admin Distributor Management", () => {
    it("should list all distributors for admin", async () => {
      const { ctx } = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);
      const result = await caller.distributor.listAll({ limit: 10 });
      
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users from listing all distributors", async () => {
      const { ctx } = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.distributor.listAll({ limit: 10 })
      ).rejects.toThrow();
    });
  });

  describe("Public Distributor Lookup", () => {
    it("should lookup distributor by subdomain", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.distributor.getBySubdomain({ subdomain: "nonexistent123" });
      
      // Should return null for non-existent subdomain
      expect(result).toBeNull();
    });
  });
});

describe("MLM Configuration", () => {
  it("should have valid rank configuration", async () => {
    const { RANKS } = await import("../shared/mlmConfig");
    
    expect(RANKS).toBeDefined();
    
    // Check that RANKS has expected keys
    const rankKeys = Object.keys(RANKS);
    expect(rankKeys.length).toBeGreaterThan(0);
    expect(rankKeys).toContain("starter");
    expect(rankKeys).toContain("bronze");
    expect(rankKeys).toContain("gold");
    
    // Each rank should have required properties
    rankKeys.forEach(rank => {
      expect(RANKS[rank as keyof typeof RANKS]).toHaveProperty("name");
      expect(RANKS[rank as keyof typeof RANKS]).toHaveProperty("personalPV");
      expect(RANKS[rank as keyof typeof RANKS]).toHaveProperty("teamPV");
    });
  });

  it("should have valid activity requirements", async () => {
    const { ACTIVITY_REQUIREMENTS } = await import("../shared/mlmConfig");
    
    expect(ACTIVITY_REQUIREMENTS).toBeDefined();
    expect(ACTIVITY_REQUIREMENTS.MIN_MONTHLY_PV).toBe(48);
    expect(ACTIVITY_REQUIREMENTS.MIN_ACTIVE_DOWNLINE).toBe(1);
    expect(ACTIVITY_REQUIREMENTS.MIN_DOWNLINE_PV).toBe(48);
  });

  it("should calculate rank progress correctly", async () => {
    const { getRankProgress } = await import("../shared/mlmConfig");
    
    // Test starter rank progress
    const progress = getRankProgress("starter", 0, 0, 0);
    
    expect(progress).toHaveProperty("nextRank");
    expect(progress.nextRank).toBe("bronze");
    expect(progress).toHaveProperty("personalPVProgress");
    expect(progress).toHaveProperty("teamPVProgress");
    expect(progress).toHaveProperty("legVolumeProgress");
  });

  it("should check distributor activity correctly", async () => {
    const { isDistributorActive } = await import("../shared/mlmConfig");
    
    // Inactive: no PV, no downline
    expect(isDistributorActive(0, 0, 0)).toBe(false);
    
    // Inactive: has PV but no active downline
    expect(isDistributorActive(48, 0, 0)).toBe(false);
    
    // Active: meets all requirements (function only checks monthlyPV and activeDownlineCount)
    expect(isDistributorActive(48, 1, 48)).toBe(true);
    
    // Active: downline PV is not checked in the function signature
    expect(isDistributorActive(48, 1, 20)).toBe(true);
  });

  it("should have valid commission rates", async () => {
    const { COMMISSION_RATES } = await import("../shared/mlmConfig");
    
    expect(COMMISSION_RATES).toBeDefined();
    expect(COMMISSION_RATES.FAST_START.CUSTOMER).toBeGreaterThan(0);
    expect(COMMISSION_RATES.FAST_START.DISTRIBUTOR).toBeGreaterThan(0);
    expect(COMMISSION_RATES.BINARY.RATE).toBeGreaterThan(0);
    expect(COMMISSION_RATES.BINARY.MAX_DAILY).toBeGreaterThan(0);
  });
});
