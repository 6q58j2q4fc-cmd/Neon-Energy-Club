import { describe, it, expect, beforeAll } from "vitest";
import { registerNativeUser, authenticateNativeUser } from "./nativeAuth";
import { getDistributorByUserId, enrollDistributor } from "./db";

describe("Distributor Enrollment Flow", () => {
  let testUserId: number;
  const testUsername = `testdist_${Date.now()}`;
  const testEmail = `${testUsername}@test.com`;
  const testPassword = "SecurePass123!";

  beforeAll(async () => {
    // Register a new user as distributor type
    const registerResult = await registerNativeUser({
      username: testUsername,
      email: testEmail,
      password: testPassword,
      name: "Test Distributor",
      userType: "distributor",
      phone: "+1234567890",
    });

    expect(registerResult.success).toBe(true);
    expect(registerResult.userId).toBeDefined();
    testUserId = registerResult.userId!;
  });

  it("should register a new user with distributor type", async () => {
    expect(testUserId).toBeGreaterThan(0);
  });

  it("should authenticate the user with username and password", async () => {
    const authResult = await authenticateNativeUser(testUsername, testPassword);
    
    expect(authResult.success).toBe(true);
    expect(authResult.user).toBeDefined();
    expect(authResult.user?.userType).toBe("distributor");
    expect(authResult.user?.loginMethod).toBe("native");
  });

  it("should authenticate the user with email and password", async () => {
    const authResult = await authenticateNativeUser(testEmail, testPassword);
    
    expect(authResult.success).toBe(true);
    expect(authResult.user).toBeDefined();
    expect(authResult.user?.email).toBe(testEmail);
  });

  it("should not have distributor record before enrollment", async () => {
    const distributor = await getDistributorByUserId(testUserId);
    expect(distributor).toBeNull();
  });

  it("should enroll user as distributor", async () => {
    const distributor = await enrollDistributor({
      userId: testUserId,
      sponsorCode: undefined,
    });

    expect(distributor).toBeDefined();
    expect(distributor?.id).toBeGreaterThan(0);
    expect(distributor?.distributorCode).toBeDefined();
    expect(distributor?.distributorCode).toMatch(/^DIST/);
    expect(distributor?.rank).toBe("starter");
  });

  it("should retrieve distributor record after enrollment", async () => {
    const distributor = await getDistributorByUserId(testUserId);
    
    expect(distributor).toBeDefined();
    expect(distributor?.userId).toBe(testUserId);
    expect(distributor?.distributorCode).toBeDefined();
    expect(distributor?.status).toBe("active");
  });

  it("should not allow duplicate enrollment", async () => {
    // Try to enroll the same user again - should throw error
    await expect(async () => {
      await enrollDistributor({
        userId: testUserId,
        sponsorCode: undefined,
      });
    }).rejects.toThrow("User is already enrolled as a distributor");
    
    // Verify only one distributor record exists
    const distributor = await getDistributorByUserId(testUserId);
    expect(distributor).toBeDefined();
  });

  it("should reject invalid credentials", async () => {
    const authResult = await authenticateNativeUser(testUsername, "wrongpassword");
    
    expect(authResult.success).toBe(false);
    expect(authResult.error).toBeDefined();
    expect(authResult.user).toBeUndefined();
  });
});
