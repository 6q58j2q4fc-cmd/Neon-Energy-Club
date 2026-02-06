import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createAdminContext(): TrpcContext {
  const adminUser: AuthenticatedUser = {
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
    user: adminUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const regularUser: AuthenticatedUser = {
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
    user: regularUser,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Investor Router", () => {
  describe("investor.submit", () => {
    it("should accept valid investor inquiry submission", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.investor.submit({
        name: "John Investor",
        email: "john@investor.com",
        phone: "+1-555-123-4567",
        company: "Acme Ventures",
        investmentRange: "100k_500k",
        accreditedStatus: "yes",
        investmentType: "equity",
        referralSource: "LinkedIn",
        message: "Interested in Series A opportunity",
      });

      expect(result).toHaveProperty("success", true);
      expect(result).toHaveProperty("id");
    });

    it("should accept inquiry without optional fields", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.investor.submit({
        name: "Jane Investor",
        email: "jane@investor.com",
        investmentRange: "50k_100k",
        accreditedStatus: "unsure",
        investmentType: "convertible_note",
      });

      expect(result).toHaveProperty("success", true);
    });

    it("should reject invalid email format", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.investor.submit({
          name: "Bad Email",
          email: "not-an-email",
          investmentRange: "under_10k",
          accreditedStatus: "no",
          investmentType: "other",
        })
      ).rejects.toThrow();
    });

    it("should reject missing required fields", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.investor.submit({
          name: "",
          email: "test@test.com",
          investmentRange: "under_10k",
          accreditedStatus: "yes",
          investmentType: "equity",
        })
      ).rejects.toThrow();
    });
  });

  describe("investor.list (admin only)", () => {
    it("should allow admin to list investor inquiries", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.investor.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.investor.list()).rejects.toThrow("Unauthorized");
    });

    it("should reject unauthenticated users", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.investor.list()).rejects.toThrow();
    });
  });

  describe("investor.updateStatus (admin only)", () => {
    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.investor.updateStatus({
          id: 1,
          status: "contacted",
          adminNotes: "Called and left voicemail",
        })
      ).rejects.toThrow("Unauthorized");
    });
  });
});

describe("Blog Router", () => {
  describe("blog.list", () => {
    it("should return blog posts array", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.blog.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should filter by category", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.blog.list({ category: "product", limit: 10 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.blog.list({ limit: 5 });
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("blog.categories", () => {
    it("should return category counts", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.blog.categories();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("blog.recent", () => {
    it("should return recent posts", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.blog.recent({ limit: 5 });
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeLessThanOrEqual(5);
    });
  });

  describe("blog.create (admin only)", () => {
    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.blog.create({
          title: "Test Post",
          slug: "test-post",
          content: "Test content",
          category: "news",
          status: "draft",
        })
      ).rejects.toThrow("Unauthorized");
    });

    it("should allow admin to create posts", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.blog.create({
        title: "Test Admin Post " + Date.now(),
        slug: "test-admin-post-" + Date.now(),
        content: "This is test content for the blog post.",
        category: "news",
        status: "draft",
      });

      expect(result).toHaveProperty("success", true);
    });
  });

  describe("blog.delete (admin only)", () => {
    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.blog.delete({ id: 1 })).rejects.toThrow("Unauthorized");
    });
  });

  describe("blog.generate (admin only)", () => {
    it("should reject non-admin users", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(caller.blog.generate()).rejects.toThrow("Unauthorized");
    });
  });
});
