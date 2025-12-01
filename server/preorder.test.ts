import { describe, expect, it, beforeAll } from "vitest";
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
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
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
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
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

describe("preorder.submit", () => {
  it("allows public users to submit a pre-order", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preorder.submit({
      name: "John Doe",
      email: "john@example.com",
      phone: "555-1234",
      quantity: 2,
      address: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      country: "USA",
      notes: "Please deliver in the morning",
    });

    expect(result).toEqual({ success: true });
  });

  it("validates required fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.preorder.submit({
        name: "",
        email: "invalid-email",
        quantity: 0,
        address: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
      })
    ).rejects.toThrow();
  });
});

describe("preorder.list", () => {
  it("allows admin users to list all pre-orders", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preorder.list();

    expect(Array.isArray(result)).toBe(true);
  });

  it("denies access to non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.preorder.list()).rejects.toThrow("Unauthorized");
  });

  it("denies access to unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(caller.preorder.list()).rejects.toThrow();
  });
});

describe("preorder.updateStatus", () => {
  let testOrderId: number;

  beforeAll(async () => {
    // Create a test order first
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await caller.preorder.submit({
      name: "Test User",
      email: "test@example.com",
      quantity: 1,
      address: "456 Test Ave",
      city: "Test City",
      state: "TS",
      postalCode: "12345",
      country: "USA",
    });

    // Get the order ID
    const adminCtx = createAdminContext();
    const adminCaller = appRouter.createCaller(adminCtx);
    const orders = await adminCaller.preorder.list();
    testOrderId = orders[0]?.id || 1;
  });

  it("allows admin users to update order status", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.preorder.updateStatus({
      id: testOrderId,
      status: "confirmed",
    });

    expect(result).toEqual({ success: true });
  });

  it("denies access to non-admin users", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.preorder.updateStatus({
        id: testOrderId,
        status: "confirmed",
      })
    ).rejects.toThrow("Unauthorized");
  });

  it("denies access to unauthenticated users", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.preorder.updateStatus({
        id: testOrderId,
        status: "confirmed",
      })
    ).rejects.toThrow();
  });
});
