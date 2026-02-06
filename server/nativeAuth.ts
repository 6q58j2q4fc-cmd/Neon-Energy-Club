import bcrypt from "bcryptjs";
import crypto from "crypto";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq, or } from "drizzle-orm";

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a secure random token
 */
export function generateToken(length: number = 32): string {
  return crypto.randomBytes(length).toString("hex");
}

/**
 * Generate a unique openId for native auth users
 */
export function generateNativeOpenId(): string {
  return `native_${crypto.randomBytes(16).toString("hex")}`;
}

/**
 * Check if username is available
 */
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  
  return existing.length === 0;
}

/**
 * Check if email is available
 */
export async function isEmailAvailable(email: string): Promise<boolean> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  return existing.length === 0;
}

/**
 * Register a new user with native authentication
 */
export async function registerNativeUser(data: {
  username: string;
  email: string;
  password: string;
  name: string;
  userType: "customer" | "distributor" | "franchisee" | "admin";
  phone?: string;
}): Promise<{ success: boolean; userId?: number; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check username availability
  if (!(await isUsernameAvailable(data.username))) {
    return { success: false, error: "Username is already taken" };
  }
  
  // Check email availability
  if (!(await isEmailAvailable(data.email))) {
    return { success: false, error: "Email is already registered" };
  }
  
  // Validate password strength
  if (data.password.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  
  // Hash password
  const passwordHash = await hashPassword(data.password);
  
  // Generate unique openId for native users
  const openId = generateNativeOpenId();
  
  // Generate email verification token
  const emailVerificationToken = generateToken();
  const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  try {
    const result = await db.insert(users).values({
      openId,
      username: data.username,
      email: data.email,
      passwordHash,
      name: data.name,
      userType: data.userType,
      phone: data.phone,
      loginMethod: "native",
      emailVerificationToken,
      emailVerificationExpiry,
      emailVerified: 0,
    });
    
    const userId = result[0].insertId;
    
    return { success: true, userId };
  } catch (error: any) {
    console.error("[NativeAuth] Registration error:", error);
    return { success: false, error: "Registration failed. Please try again." };
  }
}

/**
 * Authenticate a user with username/email and password
 */
export async function authenticateNativeUser(
  usernameOrEmail: string,
  password: string
): Promise<{ success: boolean; user?: any; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Find user by username or email
  const userResults = await db.select()
    .from(users)
    .where(
      or(
        eq(users.username, usernameOrEmail),
        eq(users.email, usernameOrEmail)
      )
    )
    .limit(1);
  
  if (userResults.length === 0) {
    return { success: false, error: "Invalid username or password" };
  }
  
  const user = userResults[0];
  
  // Check if user has a password (native auth)
  if (!user.passwordHash) {
    return { success: false, error: "This account uses social login. Please sign in with your social account." };
  }
  
  // Verify password
  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { success: false, error: "Invalid username or password" };
  }
  
  // Update last signed in
  await db.update(users)
    .set({ lastSignedIn: new Date() })
    .where(eq(users.id, user.id));
  
  // Return user without sensitive data
  const { passwordHash, emailVerificationToken, passwordResetToken, ...safeUser } = user;
  
  return { success: true, user: safeUser };
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string): Promise<{ success: boolean; token?: string; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userResults = await db.select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  
  if (userResults.length === 0) {
    // Don't reveal if email exists
    return { success: true };
  }
  
  const user = userResults[0];
  
  // Generate reset token
  const resetToken = generateToken();
  const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  
  await db.update(users)
    .set({
      passwordResetToken: resetToken,
      passwordResetExpiry: resetExpiry,
    })
    .where(eq(users.id, user.id));
  
  return { success: true, token: resetToken };
}

/**
 * Reset password with token
 */
export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Find user with valid token
  const userResults = await db.select()
    .from(users)
    .where(eq(users.passwordResetToken, token))
    .limit(1);
  
  if (userResults.length === 0) {
    return { success: false, error: "Invalid or expired reset token" };
  }
  
  const user = userResults[0];
  
  // Check token expiry
  if (!user.passwordResetExpiry || new Date().toISOString() > user.passwordResetExpiry) {
    return { success: false, error: "Reset token has expired" };
  }
  
  // Validate new password
  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);
  
  // Update password and clear reset token
  await db.update(users)
    .set({
      passwordHash,
      passwordResetToken: null,
      passwordResetExpiry: null,
    })
    .where(eq(users.id, user.id));
  
  return { success: true };
}

/**
 * Verify email with token
 */
export async function verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userResults = await db.select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);
  
  if (userResults.length === 0) {
    return { success: false, error: "Invalid verification token" };
  }
  
  const user = userResults[0];
  
  // Check token expiry
  if (!user.emailVerificationExpiry || new Date().toISOString() > user.emailVerificationExpiry) {
    return { success: false, error: "Verification token has expired" };
  }
  
  // Mark email as verified
  await db.update(users)
    .set({
      emailVerified: 1,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    })
    .where(eq(users.id, user.id));
  
  return { success: true };
}

/**
 * Change password for authenticated user
 */
export async function changePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const userResults = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  
  if (userResults.length === 0) {
    return { success: false, error: "User not found" };
  }
  
  const user = userResults[0];
  
  // Verify current password
  if (user.passwordHash) {
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }
  }
  
  // Validate new password
  if (newPassword.length < 8) {
    return { success: false, error: "Password must be at least 8 characters" };
  }
  
  // Hash new password
  const passwordHash = await hashPassword(newPassword);
  
  await db.update(users)
    .set({ passwordHash })
    .where(eq(users.id, userId));
  
  return { success: true };
}
