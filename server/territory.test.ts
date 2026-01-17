import { describe, it, expect, vi, beforeEach } from "vitest";
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
    role: role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

function createPublicContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("Territory System Tests", () => {
  describe("Territory Application", () => {
    it("should start a territory application", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.territory.startApplication({
        centerLat: 40.7128,
        centerLng: -74.0060,
        radiusMiles: 5,
        territoryName: "Manhattan, NY",
        estimatedPopulation: 250000,
        termMonths: 12,
        totalCost: 5891,
      });

      expect(result).toBeDefined();
      expect(result.applicationId).toBeDefined();
      expect(typeof result.applicationId).toBe("number");
    });

    it("should get claimed territories (public)", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.territory.getClaimedTerritories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should check territory availability", async () => {
      const { ctx } = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.territory.checkAvailability({
        lat: 40.7128,
        lng: -74.0060,
        radiusMiles: 5,
      });

      expect(result).toBeDefined();
      expect(typeof result.available).toBe("boolean");
      expect(Array.isArray(result.overlappingTerritories)).toBe(true);
    });
  });

  describe("Admin Territory Management", () => {
    it("should list all applications for admin", async () => {
      const { ctx } = createAuthContext("admin");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.territory.listApplications();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin from listing applications", async () => {
      const { ctx } = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.territory.listApplications()).rejects.toThrow();
    });

    it("should reject non-admin from updating application status", async () => {
      const { ctx } = createAuthContext("user");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.territory.updateApplicationStatus({
          applicationId: 1,
          status: "approved",
        })
      ).rejects.toThrow();
    });
  });
});
