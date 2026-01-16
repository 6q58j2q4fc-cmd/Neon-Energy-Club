import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

// Use random IDs within INT range to ensure uniqueness across test runs
let idCounter = 0;

function createAuthContext(): { ctx: TrpcContext } {
  idCounter++;
  // Use random number within INT range (max ~2 billion)
  const userId = Math.floor(Math.random() * 1000000000) + idCounter;
  
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `user${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
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

describe("MLM System Tests", () => {
  describe("Distributor Enrollment", () => {
    it("should enroll a new distributor", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.distributor.enroll({
        sponsorCode: undefined,
      });

      expect(result).toHaveProperty("distributorCode");
      expect(result).toHaveProperty("rank", "starter");
      expect(result.distributorCode).toMatch(/^NEON[A-Z0-9]+$/);
    });

    it("should enroll a distributor with sponsor", async () => {
      const { ctx: ctx1 } = createAuthContext();
      const caller1 = appRouter.createCaller(ctx1);

      // First distributor (sponsor)
      const sponsor = await caller1.distributor.enroll({
        sponsorCode: undefined,
      });

      // Second distributor (with sponsor)
      const { ctx: ctx2 } = createAuthContext();
      const caller2 = appRouter.createCaller(ctx2);

      const result = await caller2.distributor.enroll({
        sponsorCode: sponsor.distributorCode,
      });

      expect(result).toHaveProperty("distributorCode");
      expect(result.distributorCode).not.toBe(sponsor.distributorCode);
    });
  });

  describe("Affiliate Links", () => {
    it("should create an affiliate link", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Enroll first
      await caller.distributor.enroll({ sponsorCode: undefined });

      const result = await caller.distributor.createAffiliateLink({
        campaignName: "Test Campaign",
        targetPath: "/products",
      });

      expect(result).toHaveProperty("linkCode");
      expect(result).toHaveProperty("url");
      expect(result.url).toContain("ref=");
    });

    it("should list affiliate links", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Enroll first
      await caller.distributor.enroll({ sponsorCode: undefined });

      // Create a link
      await caller.distributor.createAffiliateLink({
        campaignName: "Campaign 1",
        targetPath: "/",
      });

      const result = await caller.distributor.affiliateLinks();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty("linkCode");
      expect(result[0]).toHaveProperty("campaignName", "Campaign 1");
    });
  });

  describe("Newsletter Referral System", () => {
    it("should subscribe to newsletter", async () => {
      const uniqueEmail = `test-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      const result = await caller.newsletter.subscribe({
        name: "Test User",
        email: uniqueEmail,
      });

      // The API returns the subscription object with id, email, discountTier
      expect(result).toHaveProperty("id");
      expect(result).toHaveProperty("email", uniqueEmail);
      expect(result).toHaveProperty("discountTier", 1);
    });

    it("should add referrals to subscription", async () => {
      const uniqueEmail = `referrer-${Date.now()}-${Math.random().toString(36).substring(7)}@example.com`;
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);
      
      // First subscribe
      const subscription = await caller.newsletter.subscribe({
        name: "Referrer User",
        email: uniqueEmail,
      });

      // Then add referrals
      const result = await caller.newsletter.addReferrals({
        subscriptionId: subscription.id,
        friendEmails: [
          `friend1-${Date.now()}@example.com`, 
          `friend2-${Date.now()}@example.com`, 
          `friend3-${Date.now()}@example.com`
        ],
      });

      expect(result).toHaveProperty("success", true);
    });
  });

  describe("Distributor Dashboard", () => {
    it("should get distributor info", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Enroll first
      await caller.distributor.enroll({ sponsorCode: undefined });

      const result = await caller.distributor.me();

      expect(result).toHaveProperty("distributorCode");
      expect(result).toHaveProperty("rank");
      expect(result).toHaveProperty("personalSales");
      expect(result).toHaveProperty("teamSales");
    });

    it("should get distributor team", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Enroll as sponsor
      const sponsor = await caller.distributor.enroll({ sponsorCode: undefined });

      // Enroll team member
      const { ctx: ctx2 } = createAuthContext();
      const caller2 = appRouter.createCaller(ctx2);
      await caller2.distributor.enroll({ sponsorCode: sponsor.distributorCode });

      const result = await caller.distributor.team();

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
