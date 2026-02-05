import { desc, eq, sql, and, gt, lt, gte, or, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPreorder, InsertUser, InsertTerritoryLicense, InsertCrowdfunding, InsertNewsletterSubscription, preorders, users, territoryLicenses, crowdfunding, newsletterSubscriptions, distributors, sales, affiliateLinks, commissions, claimedTerritories, territoryApplications, InsertClaimedTerritory, InsertTerritoryApplication, neonNfts, InsertNeonNft, investorInquiries, InsertInvestorInquiry, blogPosts, InsertBlogPost, distributorAutoships, autoshipItems, autoshipOrders, payoutSettings, payoutRequests, payoutHistory, InsertDistributorAutoship, InsertAutoshipItem, InsertAutoshipOrder, InsertPayoutSetting, InsertPayoutRequest, InsertPayoutHistoryRecord, rankHistory, InsertRankHistoryRecord, notifications, InsertNotification, customerReferrals, customerRewards, customerReferralCodes, distributorRewardPoints, distributorFreeRewards, InsertCustomerReferral, InsertCustomerReward, InsertCustomerReferralCode, InsertDistributorRewardPoint, InsertDistributorFreeReward, rewardRedemptions, InsertRewardRedemption, vendingApplications, franchiseApplications, pushSubscriptions, InsertVendingApplication, InsertFranchiseApplication, InsertPushSubscription, userProfiles, InsertUserProfile, scheduledMeetings, InsertScheduledMeeting, vendingMachineOrders, vendingPaymentHistory, InsertVendingMachineOrder, InsertVendingPaymentHistory, vendingNetwork, vendingCommissions, InsertVendingNetwork, InsertVendingCommission, notificationPreferences, emailDigestQueue, InsertNotificationPreference, InsertEmailDigestQueueItem, mfaSettings, mfaRecoveryRequests, InsertMfaRecoveryRequest, vendingMachines, vendingInventory, vendingSales, vendingAlerts, maintenanceRequests } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Email Verification Functions
 */

import crypto from 'crypto';

/**
 * Generate a secure email verification token
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create email verification record for a user
 */
export async function createEmailVerification(userId: number): Promise<{ token: string; expiresAt: Date } | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const token = generateVerificationToken();
  // Token expires in 24 hours
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await db.update(users)
    .set({
      emailVerificationToken: token,
      emailVerificationExpiry: expiresAt,
      emailVerified: false,
    })
    .where(eq(users.id, userId));

  return { token, expiresAt };
}

/**
 * Verify email with token
 */
export async function verifyEmailToken(token: string): Promise<{ success: boolean; userId?: number; error?: string }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find user with this token
  const result = await db.select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

  if (result.length === 0) {
    return { success: false, error: "Invalid verification token" };
  }

  const user = result[0];

  // Check if token has expired
  if (user.emailVerificationExpiry && new Date() > user.emailVerificationExpiry) {
    return { success: false, error: "Verification token has expired" };
  }

  // Mark email as verified and clear token
  await db.update(users)
    .set({
      emailVerified: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    })
    .where(eq(users.id, user.id));

  return { success: true, userId: user.id };
}

/**
 * Get user by email verification token
 */
export async function getUserByVerificationToken(token: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select()
    .from(users)
    .where(eq(users.emailVerificationToken, token))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Check if user's email is verified
 */
export async function isEmailVerified(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({ emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0].emailVerified : false;
}

/**
 * Resend verification email (regenerate token)
 */
export async function resendVerificationEmail(userId: number): Promise<{ token: string; expiresAt: Date } | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if already verified
  const user = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (user.length === 0) {
    return null;
  }

  if (user[0].emailVerified) {
    return null; // Already verified
  }

  // Generate new token
  return createEmailVerification(userId);
}

/**
 * SMS Verification Functions
 */

/**
 * Generate a 6-digit OTP code for SMS verification
 */
export function generateSmsCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create SMS verification record for a user
 * Rate limited: max 3 SMS per hour, 10 per day
 */
export async function createSmsVerification(userId: number, phoneNumber: string): Promise<{ code: string; expiresAt: Date } | { error: string }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Get user to check rate limits
  const userResult = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (userResult.length === 0) {
    return { error: "User not found" };
  }

  const user = userResult[0];

  // Check rate limiting - max 1 SMS per minute
  if (user.lastSmsSentAt) {
    const timeSinceLastSms = Date.now() - user.lastSmsSentAt.getTime();
    if (timeSinceLastSms < 60 * 1000) {
      const secondsRemaining = Math.ceil((60 * 1000 - timeSinceLastSms) / 1000);
      return { error: `Please wait ${secondsRemaining} seconds before requesting another code` };
    }
  }

  // Check max attempts (reset after 1 hour)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (user.lastSmsSentAt && user.lastSmsSentAt > oneHourAgo && user.smsVerificationAttempts >= 5) {
    return { error: "Too many verification attempts. Please try again in an hour." };
  }

  const code = generateSmsCode();
  // Code expires in 10 minutes
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  // Reset attempts if last SMS was more than 1 hour ago
  const newAttempts = (user.lastSmsSentAt && user.lastSmsSentAt > oneHourAgo) 
    ? user.smsVerificationAttempts + 1 
    : 1;

  await db.update(users)
    .set({
      phone: phoneNumber,
      smsVerificationCode: code,
      smsVerificationExpiry: expiresAt,
      smsVerificationAttempts: newAttempts,
      lastSmsSentAt: new Date(),
      phoneVerified: false,
    })
    .where(eq(users.id, userId));

  return { code, expiresAt };
}

/**
 * Verify SMS code
 */
export async function verifySmsCode(userId: number, code: string): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Find user
  const result = await db.select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (result.length === 0) {
    return { success: false, error: "User not found" };
  }

  const user = result[0];

  // Check if code matches
  if (!user.smsVerificationCode || user.smsVerificationCode !== code) {
    return { success: false, error: "Invalid verification code" };
  }

  // Check if code has expired
  if (user.smsVerificationExpiry && new Date() > user.smsVerificationExpiry) {
    return { success: false, error: "Verification code has expired. Please request a new one." };
  }

  // Mark phone as verified and clear code
  await db.update(users)
    .set({
      phoneVerified: true,
      smsVerificationCode: null,
      smsVerificationExpiry: null,
      smsVerificationAttempts: 0,
    })
    .where(eq(users.id, userId));

  return { success: true };
}

/**
 * Check if user's phone is verified
 */
export async function isPhoneVerified(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({ phoneVerified: users.phoneVerified })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0].phoneVerified : false;
}

/**
 * Get user's verification status (both email and phone)
 */
export async function getVerificationStatus(userId: number): Promise<{
  emailVerified: boolean;
  phoneVerified: boolean;
  email: string | null;
  phone: string | null;
} | null> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.select({
    emailVerified: users.emailVerified,
    phoneVerified: users.phoneVerified,
    email: users.email,
    phone: users.phone,
  })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Pre-order management queries
 */

export async function createPreorder(data: InsertPreorder) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(preorders).values(data);
  // Get the inserted ID from the result
  const insertId = (result as any)[0]?.insertId;
  const orderId = insertId || Date.now();
  
  // Generate unique NFT for this order (async, don't block order creation)
  generateOrderNftAsync(orderId).catch(err => {
    console.error(`[NFT] Failed to generate NFT for order ${orderId}:`, err);
  });
  
  return { id: orderId };
}

/**
 * Generate NFT asynchronously after order creation
 */
async function generateOrderNftAsync(orderId: number) {
  try {
    const { generateOrderNft, formatOrderNumber } = await import("./nftGeneration");
    const db = await getDb();
    if (!db) return;
    
    // Generate the unique NFT artwork
    const { imageUrl, nftId } = await generateOrderNft(orderId);
    
    // Update the order with NFT details
    await db.update(preorders)
      .set({
        nftId,
        nftImageUrl: imageUrl,
        nftMintStatus: 'pending',
      })
      .where(eq(preorders.id, orderId));
    
    console.log(`[NFT] Generated NFT ${nftId} for order ${orderId}`);
  } catch (error) {
    console.error(`[NFT] Error generating NFT for order ${orderId}:`, error);
  }
}

export async function getAllPreorders() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  return await db.select().from(preorders).orderBy(desc(preorders.createdAt));
}

export async function getPreorderById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.select().from(preorders).where(eq(preorders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updatePreorderStatus(id: number, status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.update(preorders).set({ status }).where(eq(preorders.id, id));
}

/**
 * Get NFT details for a preorder
 */
export async function getPreorderNft(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    nftId: preorders.nftId,
    nftImageUrl: preorders.nftImageUrl,
    nftMintStatus: preorders.nftMintStatus,
    orderId: preorders.id,
    createdAt: preorders.createdAt,
  })
    .from(preorders)
    .where(eq(preorders.id, orderId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Get preorder by order number for tracking
 * Supports both NEON-00001 format and plain number
 */
export async function getPreorderByOrderNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Extract numeric ID from order number (e.g., "NEON-00001" -> 1, "00001" -> 1)
  let numericId: number | null = null;
  
  // Try to match NEON-XXXXX format
  const neonMatch = orderNumber.match(/NEON-?(\d+)/i);
  if (neonMatch) {
    numericId = parseInt(neonMatch[1], 10);
  } else {
    // Try plain number
    const plainMatch = orderNumber.match(/^\d+$/);
    if (plainMatch) {
      numericId = parseInt(orderNumber, 10);
    }
  }
  
  if (!numericId) {
    return null;
  }
  
  const result = await db.select()
    .from(preorders)
    .where(eq(preorders.id, numericId))
    .limit(1);
  
  if (result.length === 0) return null;
  
  const order = result[0];
  return {
    ...order,
    nftOrderNumber: `NEON-${String(order.id).padStart(5, '0')}`,
    nftRarity: getNftRarity(order.id),
  };
}

// Helper function to determine NFT rarity based on order number
function getNftRarity(orderId: number): string {
  if (orderId <= 10) return 'Legendary';
  if (orderId <= 50) return 'Epic';
  if (orderId <= 200) return 'Rare';
  if (orderId <= 500) return 'Uncommon';
  return 'Common';
}

/**
 * Get all NFTs for a user's orders by email
 */
export async function getUserNfts(email: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    nftId: preorders.nftId,
    nftImageUrl: preorders.nftImageUrl,
    nftMintStatus: preorders.nftMintStatus,
    orderId: preorders.id,
    createdAt: preorders.createdAt,
  })
    .from(preorders)
    .where(eq(preorders.email, email))
    .orderBy(desc(preorders.createdAt));
}

/**
 * Territory License (Franchise) management queries
 */

export async function createTerritoryLicense(data: InsertTerritoryLicense) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(territoryLicenses).values(data);
  return result;
}

export async function getAllTerritoryLicenses() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  return await db.select().from(territoryLicenses).orderBy(desc(territoryLicenses.createdAt));
}

export async function getTerritoryLicenseById(id: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.select().from(territoryLicenses).where(eq(territoryLicenses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateTerritoryLicenseStatus(id: number, status: "pending" | "approved" | "rejected" | "active") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.update(territoryLicenses).set({ status }).where(eq(territoryLicenses.id, id));
}

/**
 * Crowdfunding contribution queries
 */

export async function createCrowdfundingContribution(data: InsertCrowdfunding) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.insert(crowdfunding).values(data);
  return result;
}

export async function getAllCrowdfundingContributions() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  return await db.select().from(crowdfunding).orderBy(desc(crowdfunding.createdAt));
}

// Get recent contributions for social proof (public, limited fields for privacy)
export async function getRecentCrowdfundingContributions(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  
  return await db.select({
    id: crowdfunding.id,
    name: crowdfunding.name,
    email: crowdfunding.email,
    amount: crowdfunding.amount,
    tier: crowdfunding.rewardTier,
    createdAt: crowdfunding.createdAt,
  })
  .from(crowdfunding)
  .where(eq(crowdfunding.status, "completed"))
  .orderBy(desc(crowdfunding.createdAt))
  .limit(limit);
}

export async function getCrowdfundingStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.select({
    totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
    totalBackers: sql<number>`COUNT(*)`,
  }).from(crowdfunding).where(eq(crowdfunding.status, "completed"));
  
  return result[0] || { totalAmount: 0, totalBackers: 0 };
}

export async function updateCrowdfundingStatus(id: number, status: "pending" | "completed" | "refunded") {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.update(crowdfunding).set({ status }).where(eq(crowdfunding.id, id));
}

// Generate unique coupon code
function generateCouponCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars like 0,O,1,I
  let code = 'NEON';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Validate email format strictly
function isValidEmail(email: string): boolean {
  // RFC 5322 compliant email regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(email)) return false;
  
  // Additional checks
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  
  // Must have at least one dot in domain
  if (!domain.includes('.')) return false;
  
  // Domain extension must be at least 2 chars
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return false;
  
  return true;
}

// Newsletter subscription functions
export async function subscribeNewsletter(input: { email: string; name: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Validate email format
  const normalizedEmail = input.email.toLowerCase().trim();
  if (!isValidEmail(normalizedEmail)) {
    throw new Error("Please enter a valid email address");
  }
  
  // Check if email already exists
  const existing = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, normalizedEmail)).limit(1);
  
  if (existing.length > 0) {
    throw new Error("This email is already subscribed");
  }
  
  // Generate unique coupon code
  let couponCode = generateCouponCode();
  let attempts = 0;
  while (attempts < 10) {
    const existingCoupon = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.couponCode, couponCode)).limit(1);
    if (existingCoupon.length === 0) break;
    couponCode = generateCouponCode();
    attempts++;
  }
  
  const result = await db.insert(newsletterSubscriptions).values({
    email: normalizedEmail,
    name: input.name,
    discountTier: 1, // Base tier for email signup
    referralCount: 0,
    couponCode,
    couponUsed: false,
    status: "active",
  });
  
  return {
    id: Number(result[0].insertId),
    email: normalizedEmail,
    discountTier: 1,
    couponCode,
  };
}

export async function getNewsletterSubscription(subscriptionId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }
  
  const result = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.id, subscriptionId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function addNewsletterReferrals(subscriptionId: number, friendEmails: string[]) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Get the referrer subscription
  const referrer = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.id, subscriptionId)).limit(1);
  
  if (referrer.length === 0) {
    throw new Error("Subscription not found");
  }
  
  // Validate and deduplicate friend emails
  const validEmails: string[] = [];
  const seenEmails = new Set<string>();
  const referrerEmail = referrer[0].email.toLowerCase();
  
  for (const email of friendEmails) {
    const normalizedEmail = email.toLowerCase().trim();
    
    // Skip if not valid email
    if (!isValidEmail(normalizedEmail)) {
      throw new Error(`Invalid email format: ${email}`);
    }
    
    // Skip if same as referrer
    if (normalizedEmail === referrerEmail) {
      throw new Error("You cannot refer yourself");
    }
    
    // Skip duplicates in this batch
    if (seenEmails.has(normalizedEmail)) {
      continue;
    }
    
    // Check if already exists in database
    const existing = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, normalizedEmail)).limit(1);
    if (existing.length > 0) {
      throw new Error(`Email ${email} is already subscribed`);
    }
    
    seenEmails.add(normalizedEmail);
    validEmails.push(normalizedEmail);
  }
  
  if (validEmails.length < 3) {
    throw new Error("Please provide 3 unique, valid email addresses");
  }
  
  // Add each friend as a new subscription
  let addedCount = 0;
  for (const email of validEmails) {
    const friendCouponCode = generateCouponCode();
    try {
      await db.insert(newsletterSubscriptions).values({
        email,
        referrerId: subscriptionId,
        discountTier: 1,
        referralCount: 0,
        couponCode: friendCouponCode,
        couponUsed: false,
        status: "active",
      });
      addedCount++;
    } catch (error) {
      console.log(`Failed to add ${email}:`, error);
    }
  }
  
  // Update referrer's discount tier and referral count
  await db.update(newsletterSubscriptions)
    .set({ 
      discountTier: 2, // Upgrade to tier 2 (25% off)
      referralCount: referrer[0].referralCount + addedCount,
    })
    .where(eq(newsletterSubscriptions.id, subscriptionId));
}

export async function getNewsletterStats() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.select({
    totalSubscribers: sql<number>`COUNT(*)`,
    activeSubscribers: sql<number>`SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END)`,
    totalReferrals: sql<number>`SUM(referralCount)`,
  }).from(newsletterSubscriptions);
  
  return result[0] || { totalSubscribers: 0, activeSubscribers: 0, totalReferrals: 0 };
}

// List all newsletter subscriptions (admin)
export async function listNewsletterSubscriptions() {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  return await db.select().from(newsletterSubscriptions).orderBy(desc(newsletterSubscriptions.createdAt));
}

// Validate a coupon code and return discount info
export async function validateCouponCode(couponCode: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const normalizedCode = couponCode.toUpperCase().trim();
  
  const subscription = await db.select().from(newsletterSubscriptions)
    .where(eq(newsletterSubscriptions.couponCode, normalizedCode))
    .limit(1);
  
  if (subscription.length === 0) {
    return { valid: false, error: "Invalid coupon code" };
  }
  
  const sub = subscription[0];
  
  if (sub.couponUsed) {
    return { valid: false, error: "This coupon has already been used" };
  }
  
  // Determine discount percentage based on tier
  const discountPercent = sub.discountTier === 2 ? 25 : 10;
  
  return {
    valid: true,
    couponCode: normalizedCode,
    discountPercent,
    discountTier: sub.discountTier,
    subscriberEmail: sub.email,
  };
}

// Redeem a coupon code (mark as used)
export async function redeemCouponCode(couponCode: string, orderId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const normalizedCode = couponCode.toUpperCase().trim();
  
  // First validate the coupon
  const validation = await validateCouponCode(normalizedCode);
  if (!validation.valid) {
    throw new Error(validation.error);
  }
  
  // Mark coupon as used
  await db.update(newsletterSubscriptions)
    .set({
      couponUsed: true,
      couponUsedAt: new Date(),
      couponUsedOrderId: orderId,
    })
    .where(eq(newsletterSubscriptions.couponCode, normalizedCode));
  
  return { success: true, discountPercent: validation.discountPercent };
}

// Distributor functions
export async function enrollDistributor(input: { userId: number; sponsorCode?: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Check if user is already a distributor
  const existing = await db.select().from(distributors).where(eq(distributors.userId, input.userId)).limit(1);
  
  if (existing.length > 0) {
    throw new Error("User is already enrolled as a distributor");
  }
  
  // Find sponsor if code provided
  let sponsorId: number | undefined;
  if (input.sponsorCode) {
    const sponsor = await db.select().from(distributors).where(eq(distributors.distributorCode, input.sponsorCode)).limit(1);
    if (sponsor.length === 0) {
      throw new Error("Invalid sponsor code");
    }
    sponsorId = sponsor[0].id;
  }
  
  // Generate unique distributor code with DIST prefix to differentiate from customer codes
  const distributorCode = `DIST${input.userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const result = await db.insert(distributors).values({
    userId: input.userId,
    sponsorId,
    distributorCode,
    rank: "starter",
    personalSales: 0,
    teamSales: 0,
    totalEarnings: 0,
    availableBalance: 0,
    status: "active",
  });
  
  return {
    id: Number(result[0].insertId),
    distributorCode,
    rank: "starter",
  };
}

export async function getDistributorByUserId(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const result = await db.select().from(distributors).where(eq(distributors.userId, userId)).limit(1);
  return result[0] || null;
}

// Update distributor country
export async function updateDistributorCountry(distributorId: number, country: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  await db.update(distributors)
    .set({ country: country.toUpperCase().substring(0, 2) })
    .where(eq(distributors.id, distributorId));
  
  return true;
}

// Get recent distributor enrollments for social proof (public, limited fields for privacy)
export async function getRecentDistributorEnrollments(limit: number = 10) {
  const db = await getDb();
  if (!db) {
    return [];
  }
  
  // Join with users to get names and location info
  const result = await db.select({
    id: distributors.id,
    name: users.name,
    city: users.city,
    state: users.state,
    createdAt: distributors.createdAt,
  })
  .from(distributors)
  .leftJoin(users, eq(distributors.userId, users.id))
  .orderBy(desc(distributors.createdAt))
  .limit(limit);
  
  return result;
}

export async function getDistributorStats(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) {
    throw new Error("Distributor not found");
  }
  
  // Get team size
  const teamSize = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(distributors).where(eq(distributors.sponsorId, distributor.id));
  
  // Get recent sales
  const recentSales = await db.select().from(sales)
    .where(eq(sales.distributorId, distributor.id))
    .orderBy(desc(sales.createdAt))
    .limit(10);
  
  return {
    distributor,
    teamSize: teamSize[0]?.count || 0,
    recentSales,
  };
}

export async function getDistributorTeam(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) {
    throw new Error("Distributor not found");
  }
  
  // Get direct team members
  const team = await db.select().from(distributors).where(eq(distributors.sponsorId, distributor.id));
  
  return team;
}

// Affiliate link functions
export async function createAffiliateLink(userId: number, input: { campaignName?: string; targetPath: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) {
    throw new Error("Distributor not found");
  }
  
  // Generate unique link code
  const linkCode = `${distributor.distributorCode}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const result = await db.insert(affiliateLinks).values({
    distributorId: distributor.id,
    linkCode,
    campaignName: input.campaignName,
    targetPath: input.targetPath,
    clicks: 0,
    conversions: 0,
    status: "active",
  });
  
  return {
    id: Number(result[0].insertId),
    linkCode,
    url: `https://neon.energy/?ref=${linkCode}`,
  };
}

export async function getAffiliateLinks(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) {
    throw new Error("Distributor not found");
  }
  
  const links = await db.select().from(affiliateLinks)
    .where(eq(affiliateLinks.distributorId, distributor.id))
    .orderBy(desc(affiliateLinks.createdAt));
  
  return links;
}

// Commission calculation engine
export async function calculateCommission(saleId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const sale = await db.select().from(sales).where(eq(sales.id, saleId)).limit(1);
  if (sale.length === 0) {
    throw new Error("Sale not found");
  }
  
  const saleData = sale[0];
  if (!saleData.distributorId) {
    throw new Error("Sale has no distributor");
  }
  const distributor = await db.select().from(distributors).where(eq(distributors.id, saleData.distributorId)).limit(1);
  
  if (distributor.length === 0) {
    throw new Error("Distributor not found");
  }
  
  const dist = distributor[0];
  
  // Commission rates by rank - consistent with compensation plan PDF
  const commissionRates: Record<string, number> = {
    starter: 0.20,       // 20%
    bronze: 0.25,        // 25%
    silver: 0.27,        // 27%
    gold: 0.30,          // 30%
    platinum: 0.32,      // 32%
    diamond: 0.35,       // 35%
    crown_diamond: 0.37, // 37%
    royal_diamond: 0.40, // 40%
  };
  
  const rate = commissionRates[dist.rank] || 0.20;
  const commissionAmount = Math.floor(saleData.commissionVolume * rate);
  
  // Create commission record
  await db.insert(commissions).values({
    distributorId: dist.id,
    saleId: saleData.id,
    sourceDistributorId: dist.id,
    commissionType: "direct",
    amount: commissionAmount,
    percentage: Math.floor(rate * 100),
    level: 1, // Direct sale
    status: "pending",
  });
  
  // Update distributor earnings
  await db.update(distributors)
    .set({
      totalEarnings: dist.totalEarnings + commissionAmount,
      availableBalance: dist.availableBalance + commissionAmount,
      personalSales: dist.personalSales + saleData.orderTotal,
    })
    .where(eq(distributors.id, dist.id));
  
  // Send notification about new commission
  if (dist.userId && commissionAmount > 0) {
    try {
      await createNotification({
        userId: dist.userId,
        type: 'commission_pending',
        title: '💰 New Commission Earned!',
        message: `You earned $${(commissionAmount / 100).toFixed(2)} from a direct sale. Keep up the great work!`,
        data: { amount: commissionAmount, type: 'direct', saleId: saleData.id },
      });
    } catch (err) {
      console.warn('[Commission] Failed to send notification:', err);
    }
  }
  
  // Calculate upline commissions (multi-level)
  if (dist.sponsorId) {
    await calculateUplineCommissions(dist.sponsorId, saleData.commissionVolume, 2);
  }
  
  return { commissionAmount, rate };
}

async function calculateUplineCommissions(sponsorId: number, saleAmount: number, level: number) {
  const db = await getDb();
  if (!db || level > 5) return; // Max 5 levels
  
  const sponsor = await db.select().from(distributors).where(eq(distributors.id, sponsorId)).limit(1);
  if (sponsor.length === 0) return;
  
  const dist = sponsor[0];
  
  // Upline commission rates (decreasing by level)
  const uplineRates: Record<number, number> = {
    2: 0.10, // 10% for level 2
    3: 0.05, // 5% for level 3
    4: 0.03, // 3% for level 4
    5: 0.02, // 2% for level 5
  };
  
  const rate = uplineRates[level] || 0;
  const commissionAmount = Math.floor(saleAmount * rate);
  
  if (commissionAmount > 0) {
    // Create commission record
    await db.insert(commissions).values({
      distributorId: dist.id,
      saleId: 0, // Placeholder - should be passed from parent
      sourceDistributorId: sponsorId,
      commissionType: "team",
      amount: commissionAmount,
      percentage: Math.floor(rate * 100),
      level,
      status: "pending",
    });
    
    // Update distributor earnings
    await db.update(distributors)
      .set({
        totalEarnings: dist.totalEarnings + commissionAmount,
        availableBalance: dist.availableBalance + commissionAmount,
        teamSales: dist.teamSales + saleAmount,
      })
      .where(eq(distributors.id, dist.id));
    
    // Send notification about team commission
    if (dist.userId) {
      try {
        await createNotification({
          userId: dist.userId,
          type: 'commission_pending',
          title: '💰 Team Commission Earned!',
          message: `You earned $${(commissionAmount / 100).toFixed(2)} from your team's sales (Level ${level}). Your team is growing!`,
          data: { amount: commissionAmount, type: 'team', level },
        });
      } catch (err) {
        console.warn('[Commission] Failed to send team notification:', err);
      }
    }
  }
  
  // Continue up the chain
  if (dist.sponsorId) {
    await calculateUplineCommissions(dist.sponsorId, saleAmount, level + 1);
  }
}

export async function getCommissions(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) {
    throw new Error("Distributor not found");
  }
  
  const commissionList = await db.select().from(commissions)
    .where(eq(commissions.distributorId, distributor.id))
    .orderBy(desc(commissions.createdAt));
  
  return commissionList;
}

// Rank advancement system
export async function checkRankAdvancement(userId: number) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) {
    throw new Error("Distributor not found");
  }
  
  // Rank requirements (team volume in cents) - consistent with compensation plan PDF
  const rankRequirements: Record<string, number> = {
    starter: 0,
    bronze: 50000,       // $500 TV
    silver: 200000,      // $2,000 TV
    gold: 500000,        // $5,000 TV
    platinum: 1500000,   // $15,000 TV
    diamond: 5000000,    // $50,000 TV
    crown_diamond: 15000000, // $150,000 TV
    royal_diamond: 50000000, // $500,000 TV
  };
  
  const ranks = ["starter", "bronze", "silver", "gold", "platinum", "diamond", "crown_diamond", "royal_diamond"];
  const currentRankIndex = ranks.indexOf(distributor.rank);
  
  // Check if eligible for next rank
  if (currentRankIndex < ranks.length - 1) {
    const nextRank = ranks[currentRankIndex + 1];
    const requirement = rankRequirements[nextRank];
    
    if (distributor.teamSales >= requirement) {
      // Advance rank
      await db.update(distributors)
        .set({ rank: nextRank as any })
        .where(eq(distributors.id, distributor.id));
      
      return { advanced: true, newRank: nextRank };
    }
  }
  
  return { advanced: false };
}

// ============ Blog Functions ============

export async function getBlogPosts(category?: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const { blogPosts } = await import("../drizzle/schema");
  
  let query = db.select().from(blogPosts).where(eq(blogPosts.status, "published"));
  
  if (category) {
    const results = await db.select().from(blogPosts)
      .where(and(eq(blogPosts.status, "published"), eq(blogPosts.category, category as any)))
      .orderBy(desc(blogPosts.publishedAt))
      .limit(limit);
    return results;
  }
  
  const results = await db.select().from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
  return results;
}

export async function getBlogPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  
  const { blogPosts } = await import("../drizzle/schema");
  
  // Increment view count
  await db.update(blogPosts)
    .set({ views: sql`views + 1` })
    .where(eq(blogPosts.slug, slug));
  
  const results = await db.select().from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .limit(1);
  
  return results[0] || null;
}

export async function createBlogPost(data: {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  category: "product" | "health" | "business" | "franchise" | "distributor" | "news" | "lifestyle";
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  featuredImage?: string;
  status?: "draft" | "published";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { blogPosts } = await import("../drizzle/schema");
  
  await db.insert(blogPosts).values({
    ...data,
    publishedAt: data.status === "published" ? new Date() : null,
  });
  
  return { success: true };
}

export async function updateBlogPost(id: number, data: {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: "product" | "health" | "business" | "franchise" | "distributor" | "news" | "lifestyle";
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  featuredImage?: string;
  status?: "draft" | "published" | "archived";
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const { blogPosts } = await import("../drizzle/schema");
  
  const updateData: any = { ...data };
  if (data.status === "published") {
    updateData.publishedAt = new Date();
  }
  
  await db.update(blogPosts)
    .set(updateData)
    .where(eq(blogPosts.id, id));
  
  return { success: true };
}


// ============ Territory Functions ============

export async function getClaimedTerritoriesNear(lat: number, lng: number, radiusMiles: number) {
  const db = await getDb();
  if (!db) return [];
  
  // Get all claimed territories and filter by distance
  // For simplicity, we fetch all and filter in JS (for production, use spatial queries)
  const territories = await db.select().from(claimedTerritories)
    .where(eq(claimedTerritories.status, "active"));
  
  return territories;
}

export async function getAllClaimedTerritories() {
  const db = await getDb();
  if (!db) return [];
  
  const territories = await db.select().from(claimedTerritories)
    .where(eq(claimedTerritories.status, "active"));
  
  return territories;
}

export async function createClaimedTerritory(data: Omit<InsertClaimedTerritory, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(claimedTerritories).values(data);
  return { id: Number(result[0].insertId) };
}

export async function createTerritoryApplication(data: Partial<InsertTerritoryApplication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(territoryApplications).values(data as any);
  return { id: Number(result[0].insertId) };
}

export async function updateTerritoryApplication(id: number, data: Partial<InsertTerritoryApplication>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(territoryApplications)
    .set(data as any)
    .where(eq(territoryApplications.id, id));
  
  return { success: true };
}

export async function getTerritoryApplication(id: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(territoryApplications)
    .where(eq(territoryApplications.id, id))
    .limit(1);
  
  return result[0] || null;
}

export async function getAllTerritoryApplications() {
  const db = await getDb();
  if (!db) return [];
  
  const applications = await db.select().from(territoryApplications)
    .orderBy(desc(territoryApplications.createdAt));
  
  return applications;
}

/**
 * Update claimed territory status based on expiration dates
 * Called automatically to keep map availability current
 */
export async function updateExpiredTerritories() {
  const db = await getDb();
  if (!db) return { updated: 0 };
  
  const now = new Date();
  
  // Mark expired territories
  const result = await db.update(claimedTerritories)
    .set({ status: "expired" })
    .where(
      and(
        eq(claimedTerritories.status, "active"),
        sql`${claimedTerritories.expirationDate} < ${now}`
      )
    );
  
  return { updated: result[0]?.affectedRows || 0 };
}

/**
 * Get territories expiring soon (within specified days)
 */
export async function getTerritoriesExpiringSoon(daysAhead: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  const territories = await db.select().from(claimedTerritories)
    .where(
      and(
        eq(claimedTerritories.status, "active"),
        sql`${claimedTerritories.expirationDate} BETWEEN ${now} AND ${futureDate}`
      )
    )
    .orderBy(claimedTerritories.expirationDate);
  
  return territories;
}

/**
 * Get territories due for renewal (within specified days)
 */
export async function getTerritoriesDueForRenewal(daysAhead: number = 30) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  
  const territories = await db.select().from(claimedTerritories)
    .where(
      and(
        eq(claimedTerritories.status, "active"),
        sql`${claimedTerritories.renewalDate} BETWEEN ${now} AND ${futureDate}`
      )
    )
    .orderBy(claimedTerritories.renewalDate);
  
  return territories;
}

/**
 * Update territory status (for order tracking integration)
 */
export async function updateTerritoryStatus(
  territoryId: number, 
  status: "pending" | "active" | "expired",
  renewalDate?: Date,
  expirationDate?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { status };
  if (renewalDate) updateData.renewalDate = renewalDate;
  if (expirationDate) updateData.expirationDate = expirationDate;
  
  await db.update(claimedTerritories)
    .set(updateData)
    .where(eq(claimedTerritories.id, territoryId));
  
  return { success: true };
}

/**
 * Activate a territory when payment is confirmed
 * Links territory application to claimed territory
 */
export async function activateTerritoryFromApplication(
  applicationId: number,
  termMonths: number = 12
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the application
  const application = await getTerritoryApplication(applicationId);
  if (!application) throw new Error("Application not found");
  
  // Calculate dates
  const now = new Date();
  const renewalDate = new Date(now.getTime() + (termMonths - 1) * 30 * 24 * 60 * 60 * 1000);
  const expirationDate = new Date(now.getTime() + termMonths * 30 * 24 * 60 * 60 * 1000);
  
  // Create claimed territory
  const claimedData: Omit<InsertClaimedTerritory, "id" | "createdAt"> = {
    territoryLicenseId: applicationId,
    centerLat: application.centerLat?.toString() || "0",
    centerLng: application.centerLng?.toString() || "0",
    radiusMiles: application.radiusMiles || 5,
    territoryName: application.territoryName || "Unknown Territory",
    zipCode: application.zipCode || null,
    city: application.city || null,
    state: application.state || null,
    status: "active",
    renewalDate,
    expirationDate,
  };
  
  const result = await createClaimedTerritory(claimedData);
  
  // Update application status
  await updateTerritoryApplication(applicationId, { status: "approved" });
  
  return { 
    claimedTerritoryId: result.id,
    renewalDate,
    expirationDate
  };
}

/**
 * Get territory tracking summary for admin dashboard
 */
export async function getTerritoryTrackingSummary() {
  const db = await getDb();
  if (!db) return null;
  
  const [activeCount] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(claimedTerritories)
    .where(eq(claimedTerritories.status, "active"));
  
  const [pendingCount] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(claimedTerritories)
    .where(eq(claimedTerritories.status, "pending"));
  
  const [expiredCount] = await db.select({ count: sql<number>`COUNT(*)` })
    .from(claimedTerritories)
    .where(eq(claimedTerritories.status, "expired"));
  
  const expiringSoon = await getTerritoriesExpiringSoon(30);
  const dueForRenewal = await getTerritoriesDueForRenewal(30);
  
  return {
    active: activeCount?.count || 0,
    pending: pendingCount?.count || 0,
    expired: expiredCount?.count || 0,
    expiringSoon: expiringSoon.length,
    dueForRenewal: dueForRenewal.length,
    territories: {
      expiringSoon,
      dueForRenewal
    }
  };
}


// ============ NFT Functions ============

/**
 * Get the next available NFT token ID
 */
export async function getNextNftTokenId(): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select({ maxId: sql<number>`COALESCE(MAX(tokenId), 0)` })
    .from(neonNfts);
  
  return (result[0]?.maxId || 0) + 1;
}

/**
 * Determine NFT rarity based on token ID
 * Lower token IDs = more rare
 */
export function calculateNftRarity(tokenId: number): {
  rarity: "legendary" | "epic" | "rare" | "uncommon" | "common";
  rarityRank: number;
  estimatedValue: number;
} {
  if (tokenId <= 10) {
    return { rarity: "legendary", rarityRank: tokenId, estimatedValue: 10000 - (tokenId - 1) * 500 };
  } else if (tokenId <= 50) {
    return { rarity: "epic", rarityRank: tokenId, estimatedValue: 5000 - (tokenId - 10) * 100 };
  } else if (tokenId <= 200) {
    return { rarity: "rare", rarityRank: tokenId, estimatedValue: 1000 - (tokenId - 50) * 5 };
  } else if (tokenId <= 500) {
    return { rarity: "uncommon", rarityRank: tokenId, estimatedValue: 250 - (tokenId - 200) * 0.5 };
  } else {
    return { rarity: "common", rarityRank: tokenId, estimatedValue: Math.max(50, 100 - (tokenId - 500) * 0.1) };
  }
}

/**
 * Generate NFT name based on token ID and rarity
 */
export function generateNftName(tokenId: number, rarity: string): string {
  const rarityNames: Record<string, string> = {
    legendary: "Genesis",
    epic: "Pioneer",
    rare: "Founder",
    uncommon: "Early Adopter",
    common: "Supporter"
  };
  return `NEON ${rarityNames[rarity] || "Supporter"} #${tokenId}`;
}

/**
 * Generate AI artwork prompt based on rarity tier
 */
function getNftArtworkPrompt(tokenId: number, rarity: string): string {
  const basePrompt = "Digital art of a glowing NEON energy drink can floating in space, cyberpunk style, neon green and black color scheme, electric energy particles, high quality, 4k";
  
  const rarityPrompts: Record<string, string> = {
    legendary: `${basePrompt}, surrounded by golden lightning bolts and diamond particles, legendary crown floating above, rainbow holographic effects, ultra rare collectible, token number ${tokenId} visible, epic cosmic background with galaxies`,
    epic: `${basePrompt}, purple and pink aurora borealis background, epic energy waves, glowing purple crystals, mythical dragon silhouette, token number ${tokenId} visible, dramatic lighting`,
    rare: `${basePrompt}, blue electric storm background, rare gem accents, glowing blue flames, futuristic city skyline, token number ${tokenId} visible, cinematic composition`,
    uncommon: `${basePrompt}, green matrix code rain background, digital grid floor, emerald particle effects, token number ${tokenId} visible, tech aesthetic`,
    common: `${basePrompt}, simple neon grid background, clean energy glow, token number ${tokenId} visible, minimalist style`,
  };
  
  return rarityPrompts[rarity] || rarityPrompts.common;
}

/**
 * Create a new NFT for an order/contribution with AI-generated artwork
 */
export async function createNeonNft(data: {
  orderId?: number;
  preorderId?: number;
  crowdfundingId?: number;
  userId?: number;
  ownerEmail: string;
  ownerName: string;
  packageType?: string;
}): Promise<{ tokenId: number; name: string; rarity: string; estimatedValue: number; imageUrl?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const tokenId = await getNextNftTokenId();
  const { rarity, rarityRank, estimatedValue } = calculateNftRarity(tokenId);
  const name = generateNftName(tokenId, rarity);
  
  const description = `Limited Edition NEON Energy Drink Relaunch NFT. Token #${tokenId} of the Genesis Collection. ${
    rarity === "legendary" ? "One of the first 10 ever minted - extremely rare!" :
    rarity === "epic" ? "Pioneer edition - among the first 50 supporters." :
    rarity === "rare" ? "Founder edition - early believer in the NEON revolution." :
    rarity === "uncommon" ? "Early Adopter edition - joined before the masses." :
    "Supporter edition - part of the NEON community."
  }`;
  
  // Generate AI artwork for the NFT
  let imageUrl: string | undefined;
  try {
    const { generateImage } = await import("./_core/imageGeneration");
    const prompt = getNftArtworkPrompt(tokenId, rarity);
    const result = await generateImage({ prompt });
    imageUrl = result.url;
  } catch (error) {
    console.error("[NFT] Failed to generate artwork:", error);
    // Continue without artwork - can be generated later
  }
  
  await db.insert(neonNfts).values({
    ...data,
    tokenId,
    name,
    description,
    rarity,
    rarityRank,
    estimatedValue: estimatedValue.toString(),
    imageUrl,
    blockchainStatus: "pending",
  });
  
  return { tokenId, name, rarity, estimatedValue, imageUrl };
}

/**
 * Get all NFTs (for gallery)
 */
export async function getAllNfts(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  const nfts = await db.select().from(neonNfts)
    .orderBy(neonNfts.tokenId)
    .limit(limit);
  
  return nfts;
}

/**
 * Get NFTs by user
 */
export async function getNftsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const nfts = await db.select().from(neonNfts)
    .where(eq(neonNfts.userId, userId))
    .orderBy(neonNfts.tokenId);
  
  return nfts;
}

/**
 * Get NFT by token ID
 */
export async function getNftByTokenId(tokenId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(neonNfts)
    .where(eq(neonNfts.tokenId, tokenId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get NFT statistics
 */
export async function getNftStats() {
  const db = await getDb();
  if (!db) return { totalMinted: 0, legendaryCount: 0, epicCount: 0, rareCount: 0, uncommonCount: 0, commonCount: 0 };
  
  const total = await db.select({ count: sql<number>`COUNT(*)` }).from(neonNfts);
  const legendary = await db.select({ count: sql<number>`COUNT(*)` }).from(neonNfts).where(eq(neonNfts.rarity, "legendary"));
  const epic = await db.select({ count: sql<number>`COUNT(*)` }).from(neonNfts).where(eq(neonNfts.rarity, "epic"));
  const rare = await db.select({ count: sql<number>`COUNT(*)` }).from(neonNfts).where(eq(neonNfts.rarity, "rare"));
  const uncommon = await db.select({ count: sql<number>`COUNT(*)` }).from(neonNfts).where(eq(neonNfts.rarity, "uncommon"));
  const common = await db.select({ count: sql<number>`COUNT(*)` }).from(neonNfts).where(eq(neonNfts.rarity, "common"));
  
  return {
    totalMinted: total[0]?.count || 0,
    legendaryCount: legendary[0]?.count || 0,
    epicCount: epic[0]?.count || 0,
    rareCount: rare[0]?.count || 0,
    uncommonCount: uncommon[0]?.count || 0,
    commonCount: common[0]?.count || 0,
  };
}


/**
 * Regenerate artwork for an existing NFT
 */
export async function regenerateNftArtwork(tokenId: number): Promise<{ success: boolean; imageUrl?: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const nft = await getNftByTokenId(tokenId);
  if (!nft) throw new Error("NFT not found");
  
  try {
    const { generateImage } = await import("./_core/imageGeneration");
    const prompt = getNftArtworkPrompt(tokenId, nft.rarity);
    const result = await generateImage({ prompt });
    
    if (result.url) {
      await db.update(neonNfts)
        .set({ imageUrl: result.url })
        .where(eq(neonNfts.tokenId, tokenId));
      
      return { success: true, imageUrl: result.url };
    }
    return { success: false };
  } catch (error) {
    console.error("[NFT] Failed to regenerate artwork:", error);
    throw error;
  }
}


/**
 * Get orders by user email
 */
export async function getOrdersByUserEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Get preorders by email
  const userPreorders = await db.select().from(preorders)
    .where(eq(preorders.email, email))
    .orderBy(desc(preorders.createdAt));
  
  // Get crowdfunding contributions by email
  const userCrowdfunding = await db.select().from(crowdfunding)
    .where(eq(crowdfunding.email, email))
    .orderBy(desc(crowdfunding.createdAt));
  
  return {
    preorders: userPreorders,
    crowdfunding: userCrowdfunding,
  };
}

/**
 * Get user's NFTs by email
 */
export async function getNftsByEmail(email: string) {
  const db = await getDb();
  if (!db) return [];
  
  const nfts = await db.select().from(neonNfts)
    .where(eq(neonNfts.ownerEmail, email))
    .orderBy(neonNfts.tokenId);
  
  return nfts;
}


/**
 * Update user profile information
 */
export async function updateUserProfile(userId: number, data: {
  name?: string;
  phone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = {};
  
  if (data.name !== undefined) updateData.name = data.name;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
  if (data.addressLine2 !== undefined) updateData.addressLine2 = data.addressLine2;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.state !== undefined) updateData.state = data.state;
  if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
  if (data.country !== undefined) updateData.country = data.country;
  
  if (Object.keys(updateData).length > 0) {
    await db.update(users)
      .set(updateData)
      .where(eq(users.id, userId));
  }
  
  return { success: true };
}

/**
 * Get user profile with all fields including shipping address
 */
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(users).where(eq(users.id, userId));
  
  if (result.length === 0) {
    throw new Error("User not found");
  }
  
  return result[0];
}


// ============ SMS Opt-In and Referral Tracking Functions ============

import { smsOptIns, referralTracking, smsMessageLog, InsertSMSOptIn, InsertReferralTracking, InsertSMSMessageLog } from "../drizzle/schema";

/**
 * Create a new SMS opt-in record
 */
export async function createSMSOptIn(data: InsertSMSOptIn) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(smsOptIns).values(data);
  
  return { success: true, subscriberId: data.subscriberId };
}

/**
 * Update SMS opt-in record by phone
 */
export async function updateSMSOptIn(phone: string, data: Partial<InsertSMSOptIn>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(smsOptIns)
    .set(data)
    .where(eq(smsOptIns.phone, phone));
  
  return { success: true };
}

/**
 * Get SMS opt-in by phone number
 */
export async function getSMSOptInByPhone(phone: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(smsOptIns)
    .where(eq(smsOptIns.phone, phone));
  
  return results[0] || null;
}

/**
 * Get SMS opt-in by subscriber ID
 */
export async function getSMSOptInBySubscriberId(subscriberId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(smsOptIns)
    .where(eq(smsOptIns.subscriberId, subscriberId));
  
  return results[0] || null;
}

/**
 * Get SMS opt-in by referral code
 */
export async function getSMSOptInByReferralCode(referralCode: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(smsOptIns)
    .where(eq(smsOptIns.referralCode, referralCode));
  
  return results[0] || null;
}

/**
 * Get all SMS opt-ins (admin)
 */
export async function getAllSMSOptIns() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(smsOptIns)
    .orderBy(desc(smsOptIns.createdAt));
}

/**
 * Create referral tracking record
 */
export async function createReferralTracking(data: InsertReferralTracking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(referralTracking).values(data);
  
  return { success: true };
}

/**
 * Track a referral click
 */
export async function trackReferralClick(referralCode: string, phone?: string, email?: string, name?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the referrer
  const referrer = await getSMSOptInByReferralCode(referralCode);
  if (!referrer) return { success: false, error: "Referrer not found" };
  
  // Create tracking record
  await db.insert(referralTracking).values({
    referrerId: referrer.subscriberId,
    referrerName: referrer.name || undefined,
    referralCode,
    referredPhone: phone,
    referredEmail: email,
    referredName: name,
    source: "sms",
    status: "clicked",
    clickedAt: new Date(),
  });
  
  // Increment referrer's total referrals
  await db.update(smsOptIns)
    .set({ totalReferrals: referrer.totalReferrals + 1 })
    .where(eq(smsOptIns.referralCode, referralCode));
  
  return { success: true };
}

/**
 * Update referral status
 */
export async function updateReferralStatus(referralCode: string, status: "pending" | "clicked" | "signed_up" | "customer" | "distributor") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { status };
  
  if (status === "clicked") {
    updateData.clickedAt = new Date();
  } else if (status === "signed_up") {
    updateData.signedUpAt = new Date();
  } else if (status === "customer" || status === "distributor") {
    updateData.convertedAt = new Date();
  }
  
  await db.update(referralTracking)
    .set(updateData)
    .where(eq(referralTracking.referralCode, referralCode));
  
  return { success: true };
}

/**
 * Convert referral to customer
 */
export async function convertReferralToCustomer(referralCode: string, orderId: number, customerEmail: string, customerName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(referralTracking)
    .set({
      status: "customer",
      convertedToCustomer: 1,
      customerOrderId: orderId,
      referredEmail: customerEmail,
      referredName: customerName,
      convertedAt: new Date(),
    })
    .where(eq(referralTracking.referralCode, referralCode));
  
  return { success: true };
}

/**
 * Convert referral to distributor
 */
export async function convertReferralToDistributor(referralCode: string, distributorId: number, distributorEmail: string, distributorName: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(referralTracking)
    .set({
      status: "distributor",
      convertedToDistributor: 1,
      distributorId,
      referredEmail: distributorEmail,
      referredName: distributorName,
      convertedAt: new Date(),
    })
    .where(eq(referralTracking.referralCode, referralCode));
  
  return { success: true };
}

/**
 * Increment referrer stats when a referral converts
 */
export async function incrementReferrerStats(referralCode: string, type: "customer" | "distributor") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const referrer = await getSMSOptInByReferralCode(referralCode);
  if (!referrer) return { success: false };
  
  if (type === "customer") {
    await db.update(smsOptIns)
      .set({ customersReferred: referrer.customersReferred + 1 })
      .where(eq(smsOptIns.referralCode, referralCode));
  } else {
    await db.update(smsOptIns)
      .set({ distributorsReferred: referrer.distributorsReferred + 1 })
      .where(eq(smsOptIns.referralCode, referralCode));
  }
  
  return { success: true };
}

/**
 * Get referrals by referrer code
 */
export async function getReferralsByReferrer(referralCode: string) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(referralTracking)
    .where(eq(referralTracking.referralCode, referralCode))
    .orderBy(desc(referralTracking.createdAt));
}

/**
 * Get all referral tracking records (admin)
 */
export async function getAllReferralTracking() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(referralTracking)
    .orderBy(desc(referralTracking.createdAt));
}

/**
 * Log an SMS message
 */
export async function logSMSMessage(data: InsertSMSMessageLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(smsMessageLog).values(data);
  
  return { success: true };
}

/**
 * Update SMS message status
 */
export async function updateSMSMessageStatus(messageId: string, status: "pending" | "sent" | "delivered" | "failed", errorMessage?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { status };
  
  if (status === "delivered") {
    updateData.deliveredAt = new Date();
  }
  if (errorMessage) {
    updateData.errorMessage = errorMessage;
  }
  
  await db.update(smsMessageLog)
    .set(updateData)
    .where(eq(smsMessageLog.messageId, messageId));
  
  return { success: true };
}

/**
 * Get SMS message logs (admin)
 */
export async function getSMSMessageLogs(limit: number = 100) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(smsMessageLog)
    .orderBy(desc(smsMessageLog.sentAt))
    .limit(limit);
}


// ============ Referral Leaderboard Functions ============

/**
 * Get top referrers for leaderboard
 * Returns referrers sorted by total referrals with conversion stats
 */
export async function getLeaderboard(options: {
  limit?: number;
  timeframe?: "all" | "monthly" | "weekly";
} = {}) {
  const db = await getDb();
  if (!db) return [];
  
  const { limit = 50, timeframe = "all" } = options;
  
  let query = db.select({
    id: smsOptIns.id,
    name: smsOptIns.name,
    subscriberId: smsOptIns.subscriberId,
    referralCode: smsOptIns.referralCode,
    totalReferrals: smsOptIns.totalReferrals,
    customersReferred: smsOptIns.customersReferred,
    distributorsReferred: smsOptIns.distributorsReferred,
    optInDate: smsOptIns.optInDate,
  }).from(smsOptIns)
    .where(gt(smsOptIns.totalReferrals, 0))
    .orderBy(desc(smsOptIns.totalReferrals), desc(smsOptIns.customersReferred), desc(smsOptIns.distributorsReferred))
    .limit(limit);
  
  return await query;
}

/**
 * Get leaderboard stats summary
 */
export async function getLeaderboardStats() {
  const db = await getDb();
  if (!db) return {
    totalReferrers: 0,
    totalReferrals: 0,
    totalCustomerConversions: 0,
    totalDistributorConversions: 0,
    averageReferrals: 0,
  };
  
  const result = await db.select({
    totalReferrers: sql<number>`COUNT(*)`,
    totalReferrals: sql<number>`SUM(totalReferrals)`,
    totalCustomerConversions: sql<number>`SUM(customersReferred)`,
    totalDistributorConversions: sql<number>`SUM(distributorsReferred)`,
    averageReferrals: sql<number>`AVG(totalReferrals)`,
  }).from(smsOptIns)
    .where(gt(smsOptIns.totalReferrals, 0));
  
  return result[0] || {
    totalReferrers: 0,
    totalReferrals: 0,
    totalCustomerConversions: 0,
    totalDistributorConversions: 0,
    averageReferrals: 0,
  };
}

/**
 * Get user's leaderboard position
 */
export async function getUserLeaderboardPosition(subscriberId: string) {
  const db = await getDb();
  if (!db) return null;
  
  // Get the user's stats
  const userStats = await db.select().from(smsOptIns)
    .where(eq(smsOptIns.subscriberId, subscriberId));
  
  if (!userStats[0]) return null;
  
  // Count how many users have more referrals
  const higherRanked = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(smsOptIns)
    .where(gt(smsOptIns.totalReferrals, userStats[0].totalReferrals));
  
  const position = (higherRanked[0]?.count || 0) + 1;
  
  return {
    position,
    ...userStats[0],
  };
}

/**
 * Get user's referral stats by email
 */
export async function getUserReferralStatsByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(smsOptIns)
    .where(eq(smsOptIns.email, email));
  
  if (!results[0]) return null;
  
  // Get position
  const higherRanked = await db.select({
    count: sql<number>`COUNT(*)`,
  }).from(smsOptIns)
    .where(gt(smsOptIns.totalReferrals, results[0].totalReferrals));
  
  const position = (higherRanked[0]?.count || 0) + 1;
  
  return {
    position,
    ...results[0],
  };
}


// ============ Investor Inquiry Functions ============

/**
 * Create a new investor inquiry
 */
export async function createInvestorInquiry(inquiry: InsertInvestorInquiry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(investorInquiries).values(inquiry);
  return result[0].insertId;
}

/**
 * Get all investor inquiries (admin)
 */
export async function getInvestorInquiries(options: {
  limit?: number;
  status?: string;
} = {}) {
  const db = await getDb();
  if (!db) return [];
  
  const { limit = 100, status } = options;
  
  if (status) {
    return await db.select().from(investorInquiries)
      .where(eq(investorInquiries.status, status as any))
      .orderBy(desc(investorInquiries.createdAt))
      .limit(limit);
  }
  
  return await db.select().from(investorInquiries)
    .orderBy(desc(investorInquiries.createdAt))
    .limit(limit);
}

/**
 * Update investor inquiry status
 */
export async function updateInvestorInquiryStatus(id: number, status: string, adminNotes?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status };
  if (adminNotes !== undefined) {
    updateData.adminNotes = adminNotes;
  }
  
  await db.update(investorInquiries)
    .set(updateData)
    .where(eq(investorInquiries.id, id));
}

/**
 * Delete blog post
 */
export async function deleteBlogPost(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(blogPosts)
    .where(eq(blogPosts.id, id));
}

/**
 * Get blog posts for sitemap
 */
export async function getBlogPostsForSitemap() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    slug: blogPosts.slug,
    updatedAt: blogPosts.updatedAt,
  }).from(blogPosts)
    .where(eq(blogPosts.status, "published"));
}

/**
 * Get recent blog posts for RSS feed
 */
export async function getRecentBlogPosts(limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .orderBy(desc(blogPosts.publishedAt))
    .limit(limit);
}

/**
 * Get blog post count by category
 */
export async function getBlogPostCountByCategory() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    category: blogPosts.category,
    count: sql<number>`COUNT(*)`,
  }).from(blogPosts)
    .where(eq(blogPosts.status, "published"))
    .groupBy(blogPosts.category);
}


// ============ Enhanced Distributor Functions ============

/**
 * Set distributor username
 */
export async function setDistributorUsername(userId: number, username: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if username is already taken
  const existing = await db.select().from(distributors)
    .where(eq(distributors.username, username));
  
  if (existing.length > 0) {
    throw new Error("Username is already taken");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) throw new Error("Distributor not found");
  
  await db.update(distributors)
    .set({ username })
    .where(eq(distributors.id, distributor.id));
  
  return { success: true, username };
}

/**
 * Set distributor subdomain
 */
export async function setDistributorSubdomain(userId: number, subdomain: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if subdomain is already taken
  const existing = await db.select().from(distributors)
    .where(eq(distributors.subdomain, subdomain));
  
  if (existing.length > 0) {
    throw new Error("Subdomain is already taken");
  }
  
  // Validate subdomain format
  if (!/^[a-z0-9-]+$/.test(subdomain)) {
    throw new Error("Subdomain can only contain lowercase letters, numbers, and hyphens");
  }
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) throw new Error("Distributor not found");
  
  await db.update(distributors)
    .set({ subdomain })
    .where(eq(distributors.id, distributor.id));
  
  return { success: true, subdomain, url: `https://${subdomain}.neonenergy.com` };
}

/**
 * Check if username is available
 */
export async function checkUsernameAvailable(username: string) {
  const db = await getDb();
  if (!db) return { available: false };
  
  const existing = await db.select().from(distributors)
    .where(eq(distributors.username, username));
  
  return { available: existing.length === 0 };
}

/**
 * Check if subdomain is available
 */
export async function checkSubdomainAvailable(subdomain: string) {
  const db = await getDb();
  if (!db) return { available: false };
  
  // Reserved subdomains
  const reserved = ["www", "api", "admin", "app", "mail", "support", "help", "shop", "store"];
  if (reserved.includes(subdomain.toLowerCase())) {
    return { available: false, reason: "Reserved subdomain" };
  }
  
  const existing = await db.select().from(distributors)
    .where(eq(distributors.subdomain, subdomain));
  
  return { available: existing.length === 0 };
}

/**
 * Get distributor by subdomain (for affiliate sites)
 */
export async function getDistributorBySubdomain(subdomain: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    id: distributors.id,
    distributorCode: distributors.distributorCode,
    subdomain: distributors.subdomain,
    rank: distributors.rank,
    name: users.name,
    createdAt: distributors.createdAt,
  })
  .from(distributors)
  .leftJoin(users, eq(distributors.userId, users.id))
  .where(eq(distributors.subdomain, subdomain))
  .limit(1);
  
  return result[0] || null;
}

/**
 * Get distributor genealogy tree (recursive downline)
 */
export async function getDistributorGenealogy(userId: number, maxDepth: number = 5) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) throw new Error("Distributor not found");
  
  // Build genealogy tree recursively
  async function buildTree(parentId: number, depth: number): Promise<any[]> {
    if (depth > maxDepth) return [];
    if (!db) return [];
    
    const children = await db.select({
      id: distributors.id,
      userId: distributors.userId,
      distributorCode: distributors.distributorCode,
      username: distributors.username,
      subdomain: distributors.subdomain,
      rank: distributors.rank,
      personalSales: distributors.personalSales,
      teamSales: distributors.teamSales,
      leftLegVolume: distributors.leftLegVolume,
      rightLegVolume: distributors.rightLegVolume,
      monthlyPV: distributors.monthlyPV,
      isActive: distributors.isActive,
      placementPosition: distributors.placementPosition,
      createdAt: distributors.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(distributors)
    .leftJoin(users, eq(distributors.userId, users.id))
    .where(eq(distributors.sponsorId, parentId));
    
    const result = [];
    for (const child of children) {
      const downline = await buildTree(child.id, depth + 1);
      result.push({
        ...child,
        depth,
        children: downline,
        childCount: downline.length,
      });
    }
    
    return result;
  }
  
  const tree = await buildTree(distributor.id, 1);
  
  // Calculate totals
  function countNodes(nodes: any[]): number {
    return nodes.reduce((sum, node) => sum + 1 + countNodes(node.children || []), 0);
  }
  
  return {
    distributor: {
      id: distributor.id,
      distributorCode: distributor.distributorCode,
      username: distributor.username,
      subdomain: distributor.subdomain,
      rank: distributor.rank,
      personalSales: distributor.personalSales,
      teamSales: distributor.teamSales,
      leftLegVolume: distributor.leftLegVolume,
      rightLegVolume: distributor.rightLegVolume,
      monthlyPV: distributor.monthlyPV,
      isActive: distributor.isActive,
    },
    tree,
    totalDownline: countNodes(tree),
    depth: maxDepth,
  };
}

/**
 * Get distributor rank progress
 */
export async function getDistributorRankProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) throw new Error("Distributor not found");
  
  // Import rank config
  const { RANKS, getRankProgress } = await import("../shared/mlmConfig");
  
  const currentRank = RANKS[distributor.rank as keyof typeof RANKS];
  const lesserLeg = Math.min(distributor.leftLegVolume, distributor.rightLegVolume);
  const progress = getRankProgress(
    distributor.rank as any,
    distributor.personalSales,
    distributor.teamSales,
    lesserLeg
  );
  
  return {
    currentRank: {
      key: distributor.rank,
      name: currentRank?.name || "Starter",
      level: currentRank?.level || 0,
      color: currentRank?.color || "#9CA3AF",
    },
    nextRank: progress.nextRank ? {
      key: progress.nextRank,
      name: RANKS[progress.nextRank]?.name || "Unknown",
      level: RANKS[progress.nextRank]?.level || 0,
      color: RANKS[progress.nextRank]?.color || "#9CA3AF",
    } : null,
    progress: {
      personalPV: {
        current: distributor.personalSales,
        required: progress.nextRank ? RANKS[progress.nextRank].personalPV : 0,
        percentage: progress.personalPVProgress,
      },
      teamPV: {
        current: distributor.teamSales,
        required: progress.nextRank ? RANKS[progress.nextRank].teamPV : 0,
        percentage: progress.teamPVProgress,
      },
      legVolume: {
        current: lesserLeg,
        required: progress.nextRank ? RANKS[progress.nextRank].legVolume : 0,
        percentage: progress.legVolumeProgress,
        leftLeg: distributor.leftLegVolume,
        rightLeg: distributor.rightLegVolume,
      },
    },
  };
}

/**
 * Get distributor activity status
 */
export async function getDistributorActivityStatus(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) throw new Error("Distributor not found");
  
  // Import activity requirements
  const { ACTIVITY_REQUIREMENTS, isDistributorActive } = await import("../shared/mlmConfig");
  
  // Count active personally enrolled distributors
  const activeDownline = await db.select({ count: sql<number>`COUNT(*)` })
    .from(distributors)
    .where(and(
      eq(distributors.sponsorId, distributor.id),
      eq(distributors.isActive, 1)
    ));
  
  const activeDownlineCount = activeDownline[0]?.count || 0;
  const isActive = isDistributorActive(
    distributor.monthlyPV,
    activeDownlineCount,
    ACTIVITY_REQUIREMENTS.MIN_DOWNLINE_PV
  );
  
  return {
    isActive,
    requirements: {
      monthlyPV: {
        required: ACTIVITY_REQUIREMENTS.MIN_MONTHLY_PV,
        current: distributor.monthlyPV,
        met: distributor.monthlyPV >= ACTIVITY_REQUIREMENTS.MIN_MONTHLY_PV,
        description: "Monthly order of at least 2x 24-packs of NEON (48 PV)",
      },
      activeDownline: {
        required: ACTIVITY_REQUIREMENTS.MIN_ACTIVE_DOWNLINE,
        current: activeDownlineCount,
        met: activeDownlineCount >= ACTIVITY_REQUIREMENTS.MIN_ACTIVE_DOWNLINE,
        description: "At least 1 active personally enrolled distributor with 2x 24-packs monthly",
      },
    },
    commissionEligibility: {
      fastStartBonus: true, // Always eligible for fast start on personal sales
      teamCommissions: isActive, // Must be active for team commissions
      binaryCommissions: isActive && distributor.leftLegVolume > 0 && distributor.rightLegVolume > 0,
      matchingBonus: isActive,
    },
    lastQualificationDate: distributor.lastQualificationDate,
    fastStartEligibleUntil: distributor.fastStartEligibleUntil,
  };
}

/**
 * Get distributor commission history
 */
export async function getDistributorCommissions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const distributor = await getDistributorByUserId(userId);
  if (!distributor) throw new Error("Distributor not found");
  
  const commissionList = await db.select().from(commissions)
    .where(eq(commissions.distributorId, distributor.id))
    .orderBy(desc(commissions.createdAt))
    .limit(limit);
  
  // Calculate totals by type
  const totals = {
    direct: 0,
    team: 0,
    rank_bonus: 0,
    leadership: 0,
    total: 0,
    pending: 0,
    paid: 0,
  };
  
  for (const comm of commissionList) {
    totals[comm.commissionType as keyof typeof totals] += comm.amount;
    totals.total += comm.amount;
    if (comm.status === "pending") totals.pending += comm.amount;
    if (comm.status === "paid") totals.paid += comm.amount;
  }
  
  return {
    commissions: commissionList,
    totals,
    availableBalance: distributor.availableBalance,
    totalEarnings: distributor.totalEarnings,
  };
}

/**
 * List all distributors (admin)
 */
export async function listAllDistributors(options?: {
  status?: "active" | "inactive" | "suspended";
  rank?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const { status, rank, limit = 100 } = options || {};
  
  let query = db.select({
    id: distributors.id,
    userId: distributors.userId,
    distributorCode: distributors.distributorCode,
    username: distributors.username,
    subdomain: distributors.subdomain,
    rank: distributors.rank,
    personalSales: distributors.personalSales,
    teamSales: distributors.teamSales,
    totalEarnings: distributors.totalEarnings,
    availableBalance: distributors.availableBalance,
    monthlyPV: distributors.monthlyPV,
    isActive: distributors.isActive,
    status: distributors.status,
    createdAt: distributors.createdAt,
    name: users.name,
    email: users.email,
  })
  .from(distributors)
  .leftJoin(users, eq(distributors.userId, users.id))
  .orderBy(desc(distributors.createdAt))
  .limit(limit);
  
  // Apply filters
  const conditions = [];
  if (status) conditions.push(eq(distributors.status, status));
  if (rank) conditions.push(eq(distributors.rank, rank as any));
  
  if (conditions.length > 0) {
    return await db.select({
      id: distributors.id,
      userId: distributors.userId,
      distributorCode: distributors.distributorCode,
      username: distributors.username,
      subdomain: distributors.subdomain,
      rank: distributors.rank,
      personalSales: distributors.personalSales,
      teamSales: distributors.teamSales,
      totalEarnings: distributors.totalEarnings,
      availableBalance: distributors.availableBalance,
      monthlyPV: distributors.monthlyPV,
      isActive: distributors.isActive,
      status: distributors.status,
      createdAt: distributors.createdAt,
      name: users.name,
      email: users.email,
    })
    .from(distributors)
    .leftJoin(users, eq(distributors.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(distributors.createdAt))
    .limit(limit);
  }
  
  return await query;
}

/**
 * Update distributor status (admin)
 */
export async function updateDistributorStatus(
  distributorId: number,
  status: "active" | "inactive" | "suspended"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(distributors)
    .set({ status })
    .where(eq(distributors.id, distributorId));
  
  return { success: true };
}


// ============================================
// AUTOSHIP FUNCTIONS
// ============================================

/**
 * Create a new autoship for a distributor
 */
export async function createAutoship(data: InsertDistributorAutoship) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(distributorAutoships).values(data);
  return { id: result[0].insertId };
}

/**
 * Get autoship by ID
 */
export async function getAutoshipById(autoshipId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(distributorAutoships)
    .where(eq(distributorAutoships.id, autoshipId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get autoship with items
 */
export async function getAutoshipWithItems(autoshipId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const autoship = await getAutoshipById(autoshipId);
  if (!autoship) return null;
  
  const items = await db.select().from(autoshipItems)
    .where(eq(autoshipItems.autoshipId, autoshipId));
  
  return { ...autoship, items };
}

/**
 * Get distributor's autoships
 */
export async function getDistributorAutoships(distributorId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const autoships = await db.select().from(distributorAutoships)
    .where(eq(distributorAutoships.distributorId, distributorId))
    .orderBy(desc(distributorAutoships.createdAt));
  
  // Get items for each autoship
  const result = await Promise.all(autoships.map(async (autoship) => {
    const items = await db.select().from(autoshipItems)
      .where(eq(autoshipItems.autoshipId, autoship.id));
    return { ...autoship, items };
  }));
  
  return result;
}

/**
 * Update autoship
 */
export async function updateAutoship(
  autoshipId: number,
  data: Partial<InsertDistributorAutoship>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(distributorAutoships)
    .set(data)
    .where(eq(distributorAutoships.id, autoshipId));
  
  return { success: true };
}

/**
 * Add item to autoship
 */
export async function addAutoshipItem(data: InsertAutoshipItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(autoshipItems).values(data);
  
  // Recalculate autoship totals
  await recalculateAutoshipTotals(data.autoshipId);
  
  return { id: result[0].insertId };
}

/**
 * Remove item from autoship
 */
export async function removeAutoshipItem(itemId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Get the item first to know which autoship to update
  const item = await db.select().from(autoshipItems)
    .where(eq(autoshipItems.id, itemId))
    .limit(1);
  
  if (!item[0]) throw new Error("Item not found");
  
  await db.delete(autoshipItems).where(eq(autoshipItems.id, itemId));
  
  // Recalculate autoship totals
  await recalculateAutoshipTotals(item[0].autoshipId);
  
  return { success: true };
}

/**
 * Update autoship item quantity
 */
export async function updateAutoshipItemQuantity(itemId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const item = await db.select().from(autoshipItems)
    .where(eq(autoshipItems.id, itemId))
    .limit(1);
  
  if (!item[0]) throw new Error("Item not found");
  
  await db.update(autoshipItems)
    .set({ quantity })
    .where(eq(autoshipItems.id, itemId));
  
  // Recalculate autoship totals
  await recalculateAutoshipTotals(item[0].autoshipId);
  
  return { success: true };
}

/**
 * Recalculate autoship totals
 */
async function recalculateAutoshipTotals(autoshipId: number) {
  const db = await getDb();
  if (!db) return;
  
  const items = await db.select().from(autoshipItems)
    .where(eq(autoshipItems.autoshipId, autoshipId));
  
  let totalPV = 0;
  let totalPrice = 0;
  
  for (const item of items) {
    totalPV += item.pvPerUnit * item.quantity;
    totalPrice += item.pricePerUnit * item.quantity;
  }
  
  await db.update(distributorAutoships)
    .set({ totalPV, totalPrice })
    .where(eq(distributorAutoships.id, autoshipId));
}

/**
 * Get autoships due for processing
 */
export async function getAutoshipsDueForProcessing(processDay: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(distributorAutoships)
    .where(and(
      eq(distributorAutoships.status, "active"),
      eq(distributorAutoships.processDay, processDay)
    ));
}

/**
 * Create autoship order
 */
export async function createAutoshipOrder(data: InsertAutoshipOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(autoshipOrders).values(data);
  return { id: result[0].insertId };
}

/**
 * Get autoship order history
 */
export async function getAutoshipOrderHistory(autoshipId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(autoshipOrders)
    .where(eq(autoshipOrders.autoshipId, autoshipId))
    .orderBy(desc(autoshipOrders.createdAt))
    .limit(limit);
}

/**
 * Update autoship order status
 */
export async function updateAutoshipOrderStatus(
  orderId: number,
  status: "pending" | "processing" | "completed" | "failed" | "refunded",
  additionalData?: Partial<InsertAutoshipOrder>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(autoshipOrders)
    .set({ status, ...additionalData })
    .where(eq(autoshipOrders.id, orderId));
  
  return { success: true };
}

// ============================================
// PAYOUT FUNCTIONS
// ============================================

/**
 * Get or create payout settings for a distributor
 */
export async function getPayoutSettings(distributorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(payoutSettings)
    .where(eq(payoutSettings.distributorId, distributorId))
    .limit(1);
  
  if (existing[0]) return existing[0];
  
  // Create default settings
  await db.insert(payoutSettings).values({ distributorId });
  
  const created = await db.select().from(payoutSettings)
    .where(eq(payoutSettings.distributorId, distributorId))
    .limit(1);
  
  return created[0];
}

/**
 * Update payout settings
 */
export async function updatePayoutSettings(
  distributorId: number,
  data: Partial<InsertPayoutSetting>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(payoutSettings)
    .set(data)
    .where(eq(payoutSettings.distributorId, distributorId));
  
  return { success: true };
}

/**
 * Create payout request
 */
export async function createPayoutRequest(data: InsertPayoutRequest) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payoutRequests).values(data);
  return { id: result[0].insertId };
}

/**
 * Get payout request by ID
 */
export async function getPayoutRequestById(requestId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(payoutRequests)
    .where(eq(payoutRequests.id, requestId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get distributor's payout requests
 */
export async function getDistributorPayoutRequests(distributorId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(payoutRequests)
    .where(eq(payoutRequests.distributorId, distributorId))
    .orderBy(desc(payoutRequests.createdAt))
    .limit(limit);
}

/**
 * Get pending payout requests (admin)
 */
export async function getPendingPayoutRequests() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: payoutRequests.id,
    distributorId: payoutRequests.distributorId,
    amount: payoutRequests.amount,
    netAmount: payoutRequests.netAmount,
    payoutMethod: payoutRequests.payoutMethod,
    status: payoutRequests.status,
    createdAt: payoutRequests.createdAt,
    distributorCode: distributors.distributorCode,
    distributorName: users.name,
    distributorEmail: users.email,
  })
  .from(payoutRequests)
  .leftJoin(distributors, eq(payoutRequests.distributorId, distributors.id))
  .leftJoin(users, eq(distributors.userId, users.id))
  .where(eq(payoutRequests.status, "pending"))
  .orderBy(desc(payoutRequests.createdAt));
}

/**
 * Update payout request status
 */
export async function updatePayoutRequestStatus(
  requestId: number,
  status: "pending" | "approved" | "processing" | "completed" | "failed" | "cancelled",
  additionalData?: Partial<InsertPayoutRequest>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { status, ...additionalData };
  
  // Set timestamp based on status
  if (status === "approved") updateData.approvedAt = new Date();
  if (status === "processing") updateData.processedAt = new Date();
  if (status === "completed") updateData.completedAt = new Date();
  
  await db.update(payoutRequests)
    .set(updateData)
    .where(eq(payoutRequests.id, requestId));
  
  return { success: true };
}

/**
 * Create payout history record
 */
export async function createPayoutHistoryRecord(data: InsertPayoutHistoryRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(payoutHistory).values(data);
  return { id: result[0].insertId };
}

/**
 * Get distributor's payout history
 */
export async function getDistributorPayoutHistory(distributorId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(payoutHistory)
    .where(eq(payoutHistory.distributorId, distributorId))
    .orderBy(desc(payoutHistory.createdAt))
    .limit(limit);
}

/**
 * Get all payout requests (admin)
 */
export async function getAllPayoutRequests(options?: {
  status?: string;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const { status, limit = 100 } = options || {};
  
  let query = db.select({
    id: payoutRequests.id,
    distributorId: payoutRequests.distributorId,
    amount: payoutRequests.amount,
    processingFee: payoutRequests.processingFee,
    netAmount: payoutRequests.netAmount,
    payoutMethod: payoutRequests.payoutMethod,
    status: payoutRequests.status,
    stripeTransferId: payoutRequests.stripeTransferId,
    paypalPayoutId: payoutRequests.paypalPayoutId,
    checkNumber: payoutRequests.checkNumber,
    approvedBy: payoutRequests.approvedBy,
    approvedAt: payoutRequests.approvedAt,
    processedAt: payoutRequests.processedAt,
    completedAt: payoutRequests.completedAt,
    failureReason: payoutRequests.failureReason,
    notes: payoutRequests.notes,
    createdAt: payoutRequests.createdAt,
    distributorCode: distributors.distributorCode,
    distributorName: users.name,
    distributorEmail: users.email,
  })
  .from(payoutRequests)
  .leftJoin(distributors, eq(payoutRequests.distributorId, distributors.id))
  .leftJoin(users, eq(distributors.userId, users.id))
  .orderBy(desc(payoutRequests.createdAt))
  .limit(limit);
  
  if (status) {
    return await db.select({
      id: payoutRequests.id,
      distributorId: payoutRequests.distributorId,
      amount: payoutRequests.amount,
      processingFee: payoutRequests.processingFee,
      netAmount: payoutRequests.netAmount,
      payoutMethod: payoutRequests.payoutMethod,
      status: payoutRequests.status,
      stripeTransferId: payoutRequests.stripeTransferId,
      paypalPayoutId: payoutRequests.paypalPayoutId,
      checkNumber: payoutRequests.checkNumber,
      approvedBy: payoutRequests.approvedBy,
      approvedAt: payoutRequests.approvedAt,
      processedAt: payoutRequests.processedAt,
      completedAt: payoutRequests.completedAt,
      failureReason: payoutRequests.failureReason,
      notes: payoutRequests.notes,
      createdAt: payoutRequests.createdAt,
      distributorCode: distributors.distributorCode,
      distributorName: users.name,
      distributorEmail: users.email,
    })
    .from(payoutRequests)
    .leftJoin(distributors, eq(payoutRequests.distributorId, distributors.id))
    .leftJoin(users, eq(distributors.userId, users.id))
    .where(eq(payoutRequests.status, status as any))
    .orderBy(desc(payoutRequests.createdAt))
    .limit(limit);
  }
  
  return await query;
}

/**
 * Deduct from distributor available balance
 */
export async function deductDistributorBalance(distributorId: number, amount: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(distributors)
    .set({
      availableBalance: sql`${distributors.availableBalance} - ${amount}`,
    })
    .where(eq(distributors.id, distributorId));
  
  return { success: true };
}

/**
 * Get payout statistics (admin)
 */
export async function getPayoutStatistics() {
  const db = await getDb();
  if (!db) return null;
  
  const pending = await db.select({ 
    count: sql<number>`COUNT(*)`,
    total: sql<number>`COALESCE(SUM(amount), 0)`,
  }).from(payoutRequests).where(eq(payoutRequests.status, "pending"));
  
  const approved = await db.select({ 
    count: sql<number>`COUNT(*)`,
    total: sql<number>`COALESCE(SUM(amount), 0)`,
  }).from(payoutRequests).where(eq(payoutRequests.status, "approved"));
  
  const completed = await db.select({ 
    count: sql<number>`COUNT(*)`,
    total: sql<number>`COALESCE(SUM(amount), 0)`,
  }).from(payoutRequests).where(eq(payoutRequests.status, "completed"));
  
  const thisMonth = await db.select({ 
    count: sql<number>`COUNT(*)`,
    total: sql<number>`COALESCE(SUM(amount), 0)`,
  }).from(payoutRequests)
  .where(and(
    eq(payoutRequests.status, "completed"),
    gt(payoutRequests.completedAt, sql`DATE_SUB(NOW(), INTERVAL 30 DAY)`)
  ));
  
  return {
    pending: { count: pending[0]?.count || 0, total: pending[0]?.total || 0 },
    approved: { count: approved[0]?.count || 0, total: approved[0]?.total || 0 },
    completed: { count: completed[0]?.count || 0, total: completed[0]?.total || 0 },
    thisMonth: { count: thisMonth[0]?.count || 0, total: thisMonth[0]?.total || 0 },
  };
}


// ============================================================================
// RANK HISTORY FUNCTIONS
// ============================================================================

/**
 * Record a rank change in history
 */
export async function recordRankChange(data: {
  distributorId: number;
  previousRank: string;
  newRank: string;
  personalPVAtChange: number;
  teamPVAtChange: number;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(rankHistory).values({
    distributorId: data.distributorId,
    previousRank: data.previousRank,
    newRank: data.newRank,
    personalPVAtChange: data.personalPVAtChange,
    teamPVAtChange: data.teamPVAtChange,
    notificationSent: false,
  });
  
  return result[0]?.insertId || null;
}

/**
 * Get rank history for a distributor
 */
export async function getDistributorRankHistory(distributorId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(rankHistory)
    .where(eq(rankHistory.distributorId, distributorId))
    .orderBy(desc(rankHistory.achievedAt));
}

/**
 * Mark rank history notification as sent
 */
export async function markRankNotificationSent(historyId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(rankHistory)
    .set({ notificationSent: true })
    .where(eq(rankHistory.id, historyId));
}

/**
 * Get pending rank notifications (not yet sent)
 */
export async function getPendingRankNotifications() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(rankHistory)
    .where(eq(rankHistory.notificationSent, false))
    .orderBy(desc(rankHistory.achievedAt));
}

// ============================================================================
// IN-APP NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Create an in-app notification
 */
export async function createNotification(data: {
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: object;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(notifications).values({
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data ? JSON.stringify(data.data) : null,
    isRead: false,
  });
  
  return result[0]?.insertId || null;
}

/**
 * Get notifications for a user
 */
export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
  
  return result[0]?.count || 0;
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(eq(notifications.id, notificationId));
}

/**
 * Mark all notifications as read for a user
 */
export async function markAllNotificationsRead(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(notifications)
    .set({ isRead: true, readAt: new Date() })
    .where(and(
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ));
}

// ============================================================================
// LEADERBOARD FUNCTIONS
// ============================================================================

/**
 * Get top distributors by rank
 */
export async function getLeaderboardByRank(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  // Rank order for sorting - consistent with compensation plan PDF
  const rankOrder = sql`CASE 
    WHEN rank = 'royal_diamond' THEN 8
    WHEN rank = 'crown_diamond' THEN 7
    WHEN rank = 'diamond' THEN 6
    WHEN rank = 'platinum' THEN 5
    WHEN rank = 'gold' THEN 4
    WHEN rank = 'silver' THEN 3
    WHEN rank = 'bronze' THEN 2
    ELSE 1
  END`;
  
  return db.select({
    id: distributors.id,
    distributorCode: distributors.distributorCode,
    username: distributors.username,
    rank: distributors.rank,
    personalSales: distributors.personalSales,
    teamSales: distributors.teamSales,
    monthlyPV: distributors.monthlyPV,
    isActive: distributors.isActive,
    createdAt: distributors.createdAt,
  })
    .from(distributors)
    .orderBy(desc(rankOrder), desc(distributors.teamSales))
    .limit(limit);
}

/**
 * Get top distributors by team volume
 */
export async function getLeaderboardByTeamVolume(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: distributors.id,
    distributorCode: distributors.distributorCode,
    username: distributors.username,
    rank: distributors.rank,
    personalSales: distributors.personalSales,
    teamSales: distributors.teamSales,
    monthlyPV: distributors.monthlyPV,
    leftLegVolume: distributors.leftLegVolume,
    rightLegVolume: distributors.rightLegVolume,
    isActive: distributors.isActive,
  })
    .from(distributors)
    .orderBy(desc(distributors.teamSales))
    .limit(limit);
}

/**
 * Get top distributors by monthly PV
 */
export async function getLeaderboardByMonthlyPV(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select({
    id: distributors.id,
    distributorCode: distributors.distributorCode,
    username: distributors.username,
    rank: distributors.rank,
    personalSales: distributors.personalSales,
    teamSales: distributors.teamSales,
    monthlyPV: distributors.monthlyPV,
    isActive: distributors.isActive,
  })
    .from(distributors)
    .orderBy(desc(distributors.monthlyPV))
    .limit(limit);
}

/**
 * Get distributor's rank position
 */
export async function getDistributorRankPosition(distributorId: number): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Get the distributor's team sales
  const distributor = await db.select({ teamSales: distributors.teamSales })
    .from(distributors)
    .where(eq(distributors.id, distributorId))
    .limit(1);
  
  if (!distributor[0]) return null;
  
  // Count how many distributors have higher team sales
  const result = await db.select({ count: sql<number>`COUNT(*)` })
    .from(distributors)
    .where(gt(distributors.teamSales, distributor[0].teamSales));
  
  return (result[0]?.count || 0) + 1;
}


// ============================================
// Customer Referral & Rewards Functions
// ============================================

/**
 * Generate a unique referral code for a customer
 */
export async function generateCustomerReferralCode(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if user already has a code
  const existing = await db.select()
    .from(customerReferralCodes)
    .where(eq(customerReferralCodes.userId, userId))
    .limit(1);

  if (existing[0]) {
    return existing[0].code;
  }

  // Generate unique code with CUST prefix to differentiate from distributor codes
  const code = `CUST${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  await db.insert(customerReferralCodes).values({
    userId,
    code,
    usageCount: 0,
    successfulReferrals: 0,
    isActive: true,
  });

  return code;
}

/**
 * Get customer's referral code
 */
export async function getCustomerReferralCode(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(customerReferralCodes)
    .where(eq(customerReferralCodes.userId, userId))
    .limit(1);

  return result[0]?.code || null;
}

/**
 * Get customer referral stats
 */
export async function getCustomerReferralStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get referral code
  const codeResult = await db.select()
    .from(customerReferralCodes)
    .where(eq(customerReferralCodes.userId, userId))
    .limit(1);

  const referralCode = codeResult[0]?.code || null;
  const successfulReferrals = codeResult[0]?.successfulReferrals || 0;

  // Get all referrals
  const referrals = await db.select({
    id: customerReferrals.id,
    referredId: customerReferrals.referredId,
    purchaseCompleted: customerReferrals.purchaseCompleted,
    purchaseAmount: customerReferrals.purchaseAmount,
    createdAt: customerReferrals.createdAt,
  })
    .from(customerReferrals)
    .where(eq(customerReferrals.referrerId, userId))
    .orderBy(desc(customerReferrals.createdAt));

  // Count pending referrals
  const pendingReferrals = referrals.filter(r => !r.purchaseCompleted).length;

  return {
    referralCode,
    successfulReferrals,
    pendingReferrals,
    totalReferrals: referrals.length,
    referrals,
  };
}

/**
 * Record a new customer referral
 */
export async function recordCustomerReferral(
  referrerId: number,
  referredId: number,
  referralCode: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(customerReferrals).values({
    referrerId,
    referredId,
    referralCode,
    purchaseCompleted: false,
  });

  // Update usage count
  await db.update(customerReferralCodes)
    .set({ usageCount: sql`${customerReferralCodes.usageCount} + 1` })
    .where(eq(customerReferralCodes.code, referralCode));

  // Send notification to referrer about new referral
  try {
    const referredUser = await db.select({ name: users.name }).from(users).where(eq(users.id, referredId)).limit(1);
    const referredName = referredUser[0]?.name || 'Someone';
    await createNotification({
      userId: referrerId,
      type: 'new_referral',
      title: '🎉 New Referral!',
      message: `${referredName} just signed up using your referral code! Keep sharing to earn more rewards.`,
      data: { referredId, referralCode },
    });
  } catch (err) {
    console.warn('[Referral] Failed to send notification:', err);
  }
}

/**
 * Mark a referral as completed (purchase made)
 */
export async function completeCustomerReferral(
  referredId: number,
  orderId: number,
  purchaseAmount: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Find the referral
  const referral = await db.select()
    .from(customerReferrals)
    .where(and(
      eq(customerReferrals.referredId, referredId),
      eq(customerReferrals.purchaseCompleted, false)
    ))
    .limit(1);

  if (!referral[0]) return;

  // Update the referral
  await db.update(customerReferrals)
    .set({
      purchaseCompleted: true,
      orderId,
      purchaseAmount,
      purchaseCompletedAt: new Date(),
    })
    .where(eq(customerReferrals.id, referral[0].id));

  // Update successful referrals count
  await db.update(customerReferralCodes)
    .set({ successfulReferrals: sql`${customerReferralCodes.successfulReferrals} + 1` })
    .where(eq(customerReferralCodes.code, referral[0].referralCode));

  // Check if referrer qualifies for a reward (every 3 referrals)
  const codeResult = await db.select()
    .from(customerReferralCodes)
    .where(eq(customerReferralCodes.code, referral[0].referralCode))
    .limit(1);

  if (codeResult[0] && codeResult[0].successfulReferrals % 3 === 0) {
    // Award a free case!
    const rewardCode = `FREE${Date.now().toString(36).toUpperCase()}`;
    await db.insert(customerRewards).values({
      userId: referral[0].referrerId,
      rewardType: "free_case",
      description: "FREE 12-Pack Case - 3 for Free Reward",
      value: "42.00",
      referralCount: 3,
      status: "available",
      redemptionCode: rewardCode,
      expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    });
  }
}

/**
 * Get customer rewards
 */
export async function getCustomerRewards(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(customerRewards)
    .where(eq(customerRewards.userId, userId))
    .orderBy(desc(customerRewards.createdAt));
}

/**
 * Redeem a customer reward
 */
export async function redeemCustomerReward(
  rewardId: number,
  orderId: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const result = await db.update(customerRewards)
    .set({
      status: "redeemed",
      redeemedAt: new Date(),
      redeemedOrderId: orderId,
    })
    .where(and(
      eq(customerRewards.id, rewardId),
      eq(customerRewards.status, "available")
    ));

  return true;
}

// ============================================
// Distributor 3-for-Free Reward Points Functions
// ============================================

/**
 * Award reward points to a distributor for autoship sales
 */
export async function awardDistributorRewardPoints(
  distributorId: number,
  points: number,
  source: string,
  description: string,
  relatedId?: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const periodMonth = new Date().toISOString().substring(0, 7); // YYYY-MM

  await db.insert(distributorRewardPoints).values({
    distributorId,
    points,
    source,
    description,
    relatedId,
    periodMonth,
  });
}

/**
 * Get distributor's reward points for current month
 */
export async function getDistributorMonthlyPoints(distributorId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const periodMonth = new Date().toISOString().substring(0, 7);

  const result = await db.select({
    total: sql<number>`COALESCE(SUM(${distributorRewardPoints.points}), 0)`,
  })
    .from(distributorRewardPoints)
    .where(and(
      eq(distributorRewardPoints.distributorId, distributorId),
      eq(distributorRewardPoints.periodMonth, periodMonth)
    ));

  return result[0]?.total || 0;
}

/**
 * Check and award free case if distributor qualifies (3+ points in a month)
 */
export async function checkAndAwardDistributorFreeCase(distributorId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const monthlyPoints = await getDistributorMonthlyPoints(distributorId);
  const periodMonth = new Date().toISOString().substring(0, 7);

  // Check if already awarded this month
  const existing = await db.select()
    .from(distributorFreeRewards)
    .where(and(
      eq(distributorFreeRewards.distributorId, distributorId),
      eq(distributorFreeRewards.earnedMonth, periodMonth)
    ))
    .limit(1);

  if (existing[0]) return false; // Already awarded

  if (monthlyPoints >= 3) {
    await db.insert(distributorFreeRewards).values({
      distributorId,
      pointsRedeemed: 3,
      earnedMonth: periodMonth,
      status: "pending",
    });
    return true;
  }

  return false;
}

/**
 * Get distributor's free rewards history
 */
export async function getDistributorFreeRewards(distributorId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(distributorFreeRewards)
    .where(eq(distributorFreeRewards.distributorId, distributorId))
    .orderBy(desc(distributorFreeRewards.createdAt));
}

/**
 * Get distributor's reward points history
 */
export async function getDistributorRewardPointsHistory(distributorId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(distributorRewardPoints)
    .where(eq(distributorRewardPoints.distributorId, distributorId))
    .orderBy(desc(distributorRewardPoints.createdAt))
    .limit(50);
}

// ============================================
// Reward Redemption Functions
// ============================================

/**
 * Get a customer reward by ID
 */
export async function getCustomerRewardById(rewardId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(customerRewards)
    .where(eq(customerRewards.id, rewardId))
    .limit(1);

  return result[0] || null;
}

/**
 * Redeem a customer reward with shipping information
 */
export async function redeemCustomerRewardWithShipping(
  rewardId: number,
  shippingInfo: {
    name: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Update the reward status
  await db.update(customerRewards)
    .set({
      status: "redeemed",
      redeemedAt: new Date(),
    })
    .where(and(
      eq(customerRewards.id, rewardId),
      eq(customerRewards.status, "available")
    ));

  // Create a redemption order record
  await db.insert(rewardRedemptions).values({
    rewardId,
    rewardType: 'customer',
    name: shippingInfo.name,
    email: shippingInfo.email,
    phone: shippingInfo.phone || null,
    addressLine1: shippingInfo.addressLine1,
    addressLine2: shippingInfo.addressLine2 || null,
    city: shippingInfo.city,
    state: shippingInfo.state,
    postalCode: shippingInfo.postalCode,
    country: shippingInfo.country,
    status: 'pending',
  });

  return true;
}

/**
 * Get a distributor free reward by ID
 */
export async function getDistributorFreeRewardById(rewardId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(distributorFreeRewards)
    .where(eq(distributorFreeRewards.id, rewardId))
    .limit(1);

  return result[0] || null;
}

/**
 * Redeem a distributor free reward with shipping information
 */
export async function redeemDistributorRewardWithShipping(
  rewardId: number,
  shippingInfo: {
    name: string;
    email: string;
    phone?: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  // Update the reward status to shipped (pending fulfillment)
  await db.update(distributorFreeRewards)
    .set({
      status: "shipped",
      shippedAt: new Date(),
    })
    .where(and(
      eq(distributorFreeRewards.id, rewardId),
      eq(distributorFreeRewards.status, "pending")
    ));

  // Create a redemption order record
  await db.insert(rewardRedemptions).values({
    rewardId,
    rewardType: 'distributor',
    name: shippingInfo.name,
    email: shippingInfo.email,
    phone: shippingInfo.phone || null,
    addressLine1: shippingInfo.addressLine1,
    addressLine2: shippingInfo.addressLine2 || null,
    city: shippingInfo.city,
    state: shippingInfo.state,
    postalCode: shippingInfo.postalCode,
    country: shippingInfo.country,
    status: 'pending',
  });

  return true;
}

/**
 * Get all reward redemptions for admin
 */
export async function getAllRewardRedemptions() {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(rewardRedemptions)
    .orderBy(desc(rewardRedemptions.createdAt));
}

/**
 * Update reward redemption status
 */
export async function updateRewardRedemptionStatus(
  redemptionId: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered',
  trackingNumber?: string
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const updateData: any = { status };
  
  if (status === 'shipped' && trackingNumber) {
    updateData.trackingNumber = trackingNumber;
    updateData.shippedAt = new Date();
  }
  
  if (status === 'delivered') {
    updateData.deliveredAt = new Date();
  }

  await db.update(rewardRedemptions)
    .set(updateData)
    .where(eq(rewardRedemptions.id, redemptionId));

  return true;
}


/**
 * Get reward redemption by ID
 */
export async function getRewardRedemptionById(redemptionId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(rewardRedemptions)
    .where(eq(rewardRedemptions.id, redemptionId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get reward redemption stats for admin dashboard
 */
export async function getRewardRedemptionStats() {
  const db = await getDb();
  if (!db) return {
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    customerRedemptions: 0,
    distributorRedemptions: 0,
  };

  const allRedemptions = await db.select().from(rewardRedemptions);
  
  return {
    total: allRedemptions.length,
    pending: allRedemptions.filter(r => r.status === 'pending').length,
    processing: allRedemptions.filter(r => r.status === 'processing').length,
    shipped: allRedemptions.filter(r => r.status === 'shipped').length,
    delivered: allRedemptions.filter(r => r.status === 'delivered').length,
    customerRedemptions: allRedemptions.filter(r => r.rewardType === 'customer').length,
    distributorRedemptions: allRedemptions.filter(r => r.rewardType === 'distributor').length,
  };
}

/**
 * Get top distributors by sales volume
 */
export async function getTopDistributorsBySales(limit: number = 10, period: string = 'all-time') {
  const db = await getDb();
  if (!db) return [];

  // For now, use total sales. In production, filter by date range for weekly/monthly
  const results = await db.select({
    id: distributors.id,
    name: users.name,
    rank: distributors.rank,
    totalSales: distributors.personalSales,
    teamSize: sql<number>`(SELECT COUNT(*) FROM distributors d2 WHERE d2.sponsorId = ${distributors.id})`,
  })
    .from(distributors)
    .leftJoin(users, eq(distributors.userId, users.id))
    .orderBy(desc(distributors.personalSales))
    .limit(limit);

  return results;
}

/**
 * Get top distributors by team size
 */
export async function getTopDistributorsByTeamSize(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  // Get distributors with their team counts
  const results = await db.select({
    id: distributors.id,
    name: users.name,
    rank: distributors.rank,
    totalSales: distributors.personalSales,
    teamSize: sql<number>`(SELECT COUNT(*) FROM distributors d2 WHERE d2.sponsorId = ${distributors.id})`,
  })
    .from(distributors)
    .leftJoin(users, eq(distributors.userId, users.id))
    .orderBy(desc(sql`(SELECT COUNT(*) FROM distributors d2 WHERE d2.sponsorId = ${distributors.id})`))
    .limit(limit);

  return results;
}

// ============================================================================
// VENDING & FRANCHISE APPLICATION FUNCTIONS
// ============================================================================

/**
 * Create a vending machine application
 */
export async function createVendingApplication(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  businessName?: string;
  businessType: string;
  yearsInBusiness?: string;
  city: string;
  state: string;
  zipCode: string;
  proposedLocations?: string;
  numberOfMachines: string;
  investmentBudget?: string;
  timeline?: string;
  experience?: string;
  questions?: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  submittedAt: Date;
}): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) return { id: 0 };

  const result = await db.insert(vendingApplications).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    businessName: data.businessName || null,
    businessType: data.businessType,
    yearsInBusiness: data.yearsInBusiness || null,
    city: data.city,
    state: data.state,
    zipCode: data.zipCode,
    proposedLocations: data.proposedLocations || null,
    numberOfMachines: data.numberOfMachines,
    investmentBudget: data.investmentBudget || null,
    timeline: data.timeline || null,
    experience: data.experience || null,
    questions: data.questions || null,
    status: data.status,
    submittedAt: data.submittedAt,
  });

  return { id: result[0]?.insertId || 0 };
}

/**
 * Create a franchise application
 */
export async function createFranchiseApplication(data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  territoryCity: string;
  territoryState: string;
  territorySize: string;
  exclusivityType: string;
  investmentCapital: string;
  financingNeeded?: string;
  netWorth?: string;
  businessExperience: string;
  distributionExperience?: string;
  teamSize?: string;
  motivation: string;
  timeline: string;
  questions?: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  submittedAt: Date;
}): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) return { id: 0 };

  const result = await db.insert(franchiseApplications).values({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    phone: data.phone,
    territoryCity: data.territoryCity,
    territoryState: data.territoryState,
    territorySize: data.territorySize,
    exclusivityType: data.exclusivityType,
    investmentCapital: data.investmentCapital,
    financingNeeded: data.financingNeeded || null,
    netWorth: data.netWorth || null,
    businessExperience: data.businessExperience,
    distributionExperience: data.distributionExperience || null,
    teamSize: data.teamSize || null,
    motivation: data.motivation,
    timeline: data.timeline,
    questions: data.questions || null,
    status: data.status,
    submittedAt: data.submittedAt,
  });

  return { id: result[0]?.insertId || 0 };
}

/**
 * Get all vending applications (admin)
 */
export async function getAllVendingApplications() {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(vendingApplications)
    .orderBy(desc(vendingApplications.submittedAt));
}

/**
 * Get all franchise applications (admin)
 */
export async function getAllFranchiseApplications() {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(franchiseApplications)
    .orderBy(desc(franchiseApplications.submittedAt));
}

/**
 * Update vending application status (admin)
 */
export async function updateVendingApplicationStatus(
  applicationId: number,
  status: "pending" | "under_review" | "approved" | "rejected",
  adminNotes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(vendingApplications)
    .set({
      status,
      adminNotes: adminNotes || null,
      reviewedAt: new Date(),
    })
    .where(eq(vendingApplications.id, applicationId));
}

/**
 * Update franchise application status (admin)
 */
export async function updateFranchiseApplicationStatus(
  applicationId: number,
  status: "pending" | "under_review" | "approved" | "rejected",
  adminNotes?: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(franchiseApplications)
    .set({
      status,
      adminNotes: adminNotes || null,
      reviewedAt: new Date(),
    })
    .where(eq(franchiseApplications.id, applicationId));
}


// ============================================================================
// PUSH NOTIFICATION FUNCTIONS
// ============================================================================

/**
 * Save a push notification subscription
 */
export async function savePushSubscription(data: {
  userId: number;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if subscription already exists for this endpoint
  const existing = await db.select()
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, data.endpoint))
    .limit(1);

  if (existing[0]) {
    // Update existing subscription
    await db.update(pushSubscriptions)
      .set({
        userId: data.userId,
        p256dh: data.p256dh,
        auth: data.auth,
        userAgent: data.userAgent || null,
        isActive: true,
        updatedAt: new Date(),
      })
      .where(eq(pushSubscriptions.id, existing[0].id));
    return existing[0].id;
  }

  // Create new subscription
  const result = await db.insert(pushSubscriptions).values({
    userId: data.userId,
    endpoint: data.endpoint,
    p256dh: data.p256dh,
    auth: data.auth,
    userAgent: data.userAgent || null,
    isActive: true,
  });

  return result[0]?.insertId || null;
}

/**
 * Get push subscriptions for a user
 */
export async function getUserPushSubscriptions(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(pushSubscriptions)
    .where(and(
      eq(pushSubscriptions.userId, userId),
      eq(pushSubscriptions.isActive, true)
    ));
}

/**
 * Get all active push subscriptions for distributors
 */
export async function getDistributorPushSubscriptions() {
  const db = await getDb();
  if (!db) return [];

  // Get all users who are distributors with active push subscriptions
  const results = await db.select({
    subscriptionId: pushSubscriptions.id,
    userId: pushSubscriptions.userId,
    endpoint: pushSubscriptions.endpoint,
    p256dh: pushSubscriptions.p256dh,
    auth: pushSubscriptions.auth,
    distributorId: distributors.id,
    distributorCode: distributors.distributorCode,
  })
    .from(pushSubscriptions)
    .innerJoin(distributors, eq(pushSubscriptions.userId, distributors.userId))
    .where(eq(pushSubscriptions.isActive, true));

  return results;
}

/**
 * Deactivate a push subscription
 */
export async function deactivatePushSubscription(endpoint: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(pushSubscriptions)
    .set({ isActive: false })
    .where(eq(pushSubscriptions.endpoint, endpoint));
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(subscriptionId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(pushSubscriptions)
    .where(eq(pushSubscriptions.id, subscriptionId));
}


// ============================================================================
// USER PROFILE FUNCTIONS (Personalized Landing Pages)
// ============================================================================

/**
 * Check if a custom slug is available (not taken by any user)
 */
export async function isSlugAvailable(slug: string, excludeUserId?: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const normalizedSlug = slug.toLowerCase().trim();
  
  // Check in userProfiles table
  const existing = await db.select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.customSlug, normalizedSlug))
    .limit(1);

  if (existing[0]) {
    // If we're excluding a user (for updates), check if it's their own slug
    if (excludeUserId) {
      const ownProfile = await db.select({ userId: userProfiles.userId })
        .from(userProfiles)
        .where(eq(userProfiles.id, existing[0].id))
        .limit(1);
      if (ownProfile[0]?.userId === excludeUserId) {
        return true; // User's own slug is "available" for them
      }
    }
    return false;
  }

  // Also check distributor codes and subdomains to prevent conflicts
  const distributorConflict = await db.select({ id: distributors.id })
    .from(distributors)
    .where(sql`LOWER(${distributors.distributorCode}) = ${normalizedSlug} OR LOWER(${distributors.subdomain}) = ${normalizedSlug}`)
    .limit(1);

  if (distributorConflict[0]) {
    return false;
  }

  // Check customer referral codes
  const customerCodeConflict = await db.select({ id: customerReferralCodes.id })
    .from(customerReferralCodes)
    .where(sql`LOWER(${customerReferralCodes.code}) = ${normalizedSlug}`)
    .limit(1);

  return !customerCodeConflict[0];
}

/**
 * Get personalized profile by user ID (for landing page customization)
 */
export async function getPersonalizedProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result[0] || null;
}

/**
 * Get user profile by custom slug
 */
export async function getUserProfileBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;

  const normalizedSlug = slug.toLowerCase().trim();
  
  const result = await db.select()
    .from(userProfiles)
    .where(eq(userProfiles.customSlug, normalizedSlug))
    .limit(1);

  if (result[0]) {
    // Get associated user data
    const userData = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
    })
      .from(users)
      .where(eq(users.id, result[0].userId))
      .limit(1);

    // Get distributor data if applicable
    let distributorData = null;
    if (result[0].userType === 'distributor') {
      const distResult = await db.select({
        id: distributors.id,
        rank: distributors.rank,
        distributorCode: distributors.distributorCode,
      })
        .from(distributors)
        .where(eq(distributors.userId, result[0].userId))
        .limit(1);
      distributorData = distResult[0] || null;
    }

    return {
      ...result[0],
      user: userData[0] || null,
      distributor: distributorData,
    };
  }

  return null;
}

/**
 * Create or update user profile
 */
export async function upsertUserProfile(data: {
  userId: number;
  customSlug?: string;
  profilePhotoUrl?: string;
  displayName?: string;
  location?: string;
  bio?: string;
  instagram?: string;
  tiktok?: string;
  facebook?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  userType: "distributor" | "customer";
}): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  // Check if profile exists
  const existing = await db.select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.userId, data.userId))
    .limit(1);

  if (existing[0]) {
    // Update existing profile
    await db.update(userProfiles)
      .set({
        customSlug: data.customSlug?.toLowerCase().trim() || null,
        profilePhotoUrl: data.profilePhotoUrl || null,
        displayName: data.displayName || null,
        location: data.location || null,
        bio: data.bio || null,
        instagram: data.instagram || null,
        tiktok: data.tiktok || null,
        facebook: data.facebook || null,
        twitter: data.twitter || null,
        youtube: data.youtube || null,
        linkedin: data.linkedin || null,
        updatedAt: new Date(),
      })
      .where(eq(userProfiles.id, existing[0].id));
    return existing[0].id;
  }

  // Create new profile
  const result = await db.insert(userProfiles).values({
    userId: data.userId,
    customSlug: data.customSlug?.toLowerCase().trim() || null,
    profilePhotoUrl: data.profilePhotoUrl || null,
    displayName: data.displayName || null,
    location: data.location || null,
    bio: data.bio || null,
    instagram: data.instagram || null,
    tiktok: data.tiktok || null,
    facebook: data.facebook || null,
    twitter: data.twitter || null,
    youtube: data.youtube || null,
    linkedin: data.linkedin || null,
    userType: data.userType,
    isPublished: true,
  });

  return result[0]?.insertId || null;
}

/**
 * Update custom slug only
 */
export async function updateUserSlug(userId: number, newSlug: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const normalizedSlug = newSlug.toLowerCase().trim();

  // Verify slug is available
  const available = await isSlugAvailable(normalizedSlug, userId);
  if (!available) {
    return false;
  }

  // Check if profile exists
  const existing = await db.select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db.update(userProfiles)
      .set({ customSlug: normalizedSlug, updatedAt: new Date() })
      .where(eq(userProfiles.id, existing[0].id));
    return true;
  }

  return false;
}

/**
 * Update profile photo
 */
export async function updateProfilePhoto(userId: number, photoUrl: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const existing = await db.select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  if (existing[0]) {
    await db.update(userProfiles)
      .set({ profilePhotoUrl: photoUrl, updatedAt: new Date() })
      .where(eq(userProfiles.id, existing[0].id));
    return true;
  }

  return false;
}

/**
 * Increment page views for a profile
 */
export async function incrementProfilePageViews(slug: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const normalizedSlug = slug.toLowerCase().trim();

  await db.update(userProfiles)
    .set({ pageViews: sql`${userProfiles.pageViews} + 1` })
    .where(eq(userProfiles.customSlug, normalizedSlug));
}

/**
 * Increment signups generated for a profile
 */
export async function incrementProfileSignups(slug: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const normalizedSlug = slug.toLowerCase().trim();

  await db.update(userProfiles)
    .set({ signupsGenerated: sql`${userProfiles.signupsGenerated} + 1` })
    .where(eq(userProfiles.customSlug, normalizedSlug));
}

/**
 * Generate a unique default slug for a new user
 */
export async function generateUniqueSlug(baseName: string): Promise<string> {
  const db = await getDb();
  if (!db) return `user-${Date.now()}`;

  // Clean the base name
  let baseSlug = baseName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  if (!baseSlug) {
    baseSlug = 'neon-member';
  }

  // Check if base slug is available
  if (await isSlugAvailable(baseSlug)) {
    return baseSlug;
  }

  // Try adding numbers until we find an available slug
  let counter = 1;
  let candidateSlug = `${baseSlug}-${counter}`;
  
  while (!(await isSlugAvailable(candidateSlug)) && counter < 1000) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  return candidateSlug;
}

/**
 * Create default profile for new distributor
 */
export async function createDistributorProfile(userId: number, name: string): Promise<number | null> {
  const slug = await generateUniqueSlug(name);
  
  return upsertUserProfile({
    userId,
    customSlug: slug,
    displayName: name,
    userType: 'distributor',
  });
}

/**
 * Create default profile for new customer
 */
export async function createCustomerProfile(userId: number, name: string): Promise<number | null> {
  const slug = await generateUniqueSlug(name);
  
  return upsertUserProfile({
    userId,
    customSlug: slug,
    displayName: name,
    userType: 'customer',
  });
}

/**
 * Get all profiles with pagination
 */
export async function getAllProfiles(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return db.select()
    .from(userProfiles)
    .where(eq(userProfiles.isPublished, true))
    .orderBy(desc(userProfiles.createdAt))
    .limit(limit)
    .offset(offset);
}


// Reserved slugs that cannot be used by users
const RESERVED_SLUGS = [
  'admin', 'api', 'shop', 'join', 'about', 'products', 'faq', 'privacy', 'terms',
  'policies', 'profile', 'orders', 'leaderboard', 'investors', 'invest', 'portal',
  'blog', 'vending', 'nft-gallery', 'nfts', 'franchise', 'celebrities', 'crowdfund',
  'success', 'checkout', 'compensation', 'distributor', 'customer-portal', 'my-rewards',
  '404', 'home', 'index', 'login', 'logout', 'signup', 'register', 'settings',
  'dashboard', 'help', 'support', 'contact', 'careers', 'press', 'media', 'legal',
  'tos', 'eula', 'dmca', 'copyright', 'trademark', 'brand', 'assets', 'static',
  'public', 'private', 'internal', 'external', 'test', 'demo', 'staging', 'production',
  'dev', 'development', 'beta', 'alpha', 'release', 'version', 'v1', 'v2', 'v3',
  'neon', 'energy', 'drink', 'neon-energy', 'neonenergyclub', 'neonenergydrink',
  'r', 'd', 'ref', 'referral', 'invite', 'share', 'promo', 'discount', 'coupon',
];

/**
 * Check if a slug is available for a user (public API)
 */
export async function checkSlugAvailability(slug: string, userId: number): Promise<{ available: boolean; slug: string }> {
  const normalizedSlug = slug.toLowerCase().trim();
  
  // Check reserved slugs first
  if (RESERVED_SLUGS.includes(normalizedSlug)) {
    return { available: false, slug: normalizedSlug };
  }
  
  // Check minimum length
  if (normalizedSlug.length < 3) {
    return { available: false, slug: normalizedSlug };
  }
  
  // Check format (alphanumeric and hyphens only)
  if (!/^[a-z0-9-]+$/.test(normalizedSlug)) {
    return { available: false, slug: normalizedSlug };
  }
  
  const available = await isSlugAvailable(normalizedSlug, userId);
  return { available, slug: normalizedSlug };
}

/**
 * Get profile by slug (alias for getUserProfileBySlug)
 */
export async function getProfileBySlug(slug: string) {
  return getUserProfileBySlug(slug);
}

/**
 * Update profile slug with validation
 */
export async function updateProfileSlug(userId: number, newSlug: string) {
  const { available } = await checkSlugAvailability(newSlug, userId);
  
  if (!available) {
    throw new Error('This slug is not available');
  }
  
  const success = await updateUserSlug(userId, newSlug);
  
  if (!success) {
    throw new Error('Failed to update slug');
  }
  
  return getPersonalizedProfile(userId);
}

/**
 * Update personalized profile details
 */
export async function updatePersonalizedProfile(userId: number, data: {
  displayName?: string;
  bio?: string;
  location?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const existing = await db.select({ id: userProfiles.id })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  
  if (!existing[0]) {
    return null;
  }
  
  await db.update(userProfiles)
    .set({
      displayName: data.displayName || undefined,
      bio: data.bio || undefined,
      location: data.location || undefined,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.id, existing[0].id));
  
  return getPersonalizedProfile(userId);
}

/**
 * Increment page view for a user profile by userId
 */
export async function incrementProfilePageView(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(userProfiles)
    .set({ pageViews: sql`${userProfiles.pageViews} + 1` })
    .where(eq(userProfiles.userId, userId));
}

/**
 * Get profile stats for a user
 */
export async function getProfileStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select({
    pageViews: userProfiles.pageViews,
    signupsGenerated: userProfiles.signupsGenerated,
  })
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);
  
  return result[0] || { pageViews: 0, signupsGenerated: 0 };
}


/**
 * Get recent users who joined with their profile photos
 * Used for homepage "People who joined" section
 */
export async function getRecentJoinedUsers(limit = 10) {
  const db = await getDb();
  if (!db) return [];

  // Join users with their profiles to get photos
  const result = await db.select({
    id: users.id,
    name: users.name,
    createdAt: users.createdAt,
    profilePhotoUrl: userProfiles.profilePhotoUrl,
    displayName: userProfiles.displayName,
    location: userProfiles.location,
  })
    .from(users)
    .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
    .orderBy(desc(users.createdAt))
    .limit(limit);

  return result.map(user => ({
    id: user.id,
    name: user.displayName || user.name || 'NEON Member',
    createdAt: user.createdAt,
    profilePhotoUrl: user.profilePhotoUrl,
    location: user.location,
  }));
}

/**
 * Get total count of users/backers
 */
export async function getTotalUserCount(): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` }).from(users);
  return result[0]?.count || 0;
}


// ============================================
// SCHEDULED MEETINGS FUNCTIONS
// ============================================

/**
 * Get booked meeting slots for a date range
 */
export async function getBookedMeetingSlots(startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  
  const result = await db.select({
    id: scheduledMeetings.id,
    scheduledAt: scheduledMeetings.scheduledAt,
    durationMinutes: scheduledMeetings.durationMinutes,
  })
    .from(scheduledMeetings)
    .where(and(
      gt(scheduledMeetings.scheduledAt, startDate),
      sql`${scheduledMeetings.scheduledAt} < ${endDate}`,
      sql`${scheduledMeetings.status} NOT IN ('cancelled')`
    ));
  
  return result;
}

/**
 * Create a new scheduled meeting
 */
export async function createScheduledMeeting(data: {
  userId: number | null;
  name: string;
  email: string;
  phone: string;
  meetingType: "franchise" | "vending" | "general";
  scheduledAt: Date;
  timezone: string;
  notes: string | null;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(scheduledMeetings).values({
    userId: data.userId,
    name: data.name,
    email: data.email,
    phone: data.phone,
    meetingType: data.meetingType,
    scheduledAt: data.scheduledAt,
    timezone: data.timezone,
    notes: data.notes,
    status: "scheduled",
    durationMinutes: 30,
  });
  
  return { id: Number(result[0].insertId) };
}

/**
 * Get meetings for a specific user
 */
export async function getUserMeetings(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(scheduledMeetings)
    .where(eq(scheduledMeetings.userId, userId))
    .orderBy(desc(scheduledMeetings.scheduledAt));
}

/**
 * Get a meeting by ID
 */
export async function getMeetingById(meetingId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(scheduledMeetings)
    .where(eq(scheduledMeetings.id, meetingId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Cancel a meeting
 */
export async function cancelMeeting(meetingId: number) {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(scheduledMeetings)
    .set({ status: "cancelled" })
    .where(eq(scheduledMeetings.id, meetingId));
  
  return { success: true };
}

/**
 * Get all meetings (admin)
 */
export async function getAllMeetings(options: {
  status?: string;
  meetingType?: string;
  limit: number;
  offset: number;
}) {
  const db = await getDb();
  if (!db) return { meetings: [], total: 0 };
  
  let query = db.select().from(scheduledMeetings);
  
  const conditions = [];
  if (options.status && options.status !== "all") {
    conditions.push(eq(scheduledMeetings.status, options.status as any));
  }
  if (options.meetingType && options.meetingType !== "all") {
    conditions.push(eq(scheduledMeetings.meetingType, options.meetingType as any));
  }
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const meetings = await query
    .orderBy(desc(scheduledMeetings.scheduledAt))
    .limit(options.limit)
    .offset(options.offset);
  
  // Get total count
  let countQuery = db.select({ count: sql<number>`count(*)` }).from(scheduledMeetings);
  if (conditions.length > 0) {
    countQuery = countQuery.where(and(...conditions)) as any;
  }
  const countResult = await countQuery;
  const total = countResult[0]?.count || 0;
  
  return { meetings, total };
}

/**
 * Update meeting status (admin)
 */
export async function updateMeetingStatus(meetingId: number, data: {
  status: string;
  adminNotes?: string;
  meetingLink?: string;
}) {
  const db = await getDb();
  if (!db) return null;
  
  const updateData: any = { status: data.status };
  if (data.adminNotes !== undefined) updateData.adminNotes = data.adminNotes;
  if (data.meetingLink !== undefined) updateData.meetingLink = data.meetingLink;
  
  await db.update(scheduledMeetings)
    .set(updateData)
    .where(eq(scheduledMeetings.id, meetingId));
  
  return { success: true };
}


// ==================== VENDING MACHINE ORDERS ====================

export async function createVendingOrder(data: Omit<InsertVendingMachineOrder, "id" | "createdAt" | "updatedAt">): Promise<{ id: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vendingMachineOrders).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getVendingOrderById(orderId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db.select().from(vendingMachineOrders).where(eq(vendingMachineOrders.id, orderId)).limit(1);
  return results[0] || null;
}

export async function getUserVendingOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(vendingMachineOrders)
    .where(eq(vendingMachineOrders.userId, userId))
    .orderBy(desc(vendingMachineOrders.createdAt));
}

export async function getAllVendingOrders(options: { status?: string; limit?: number; offset?: number }) {
  const db = await getDb();
  if (!db) return { orders: [] as any[], total: 0 };
  
  const { status, limit = 50, offset = 0 } = options;
  
  let orders;
  if (status && status !== "all") {
    orders = await db.select().from(vendingMachineOrders)
      .where(eq(vendingMachineOrders.status, status as any))
      .orderBy(desc(vendingMachineOrders.createdAt))
      .limit(limit)
      .offset(offset);
  } else {
    orders = await db.select().from(vendingMachineOrders)
      .orderBy(desc(vendingMachineOrders.createdAt))
      .limit(limit)
      .offset(offset);
  }
  
  const countResult = await db.select({ count: sql<number>`count(*)` }).from(vendingMachineOrders);
  const total = countResult[0]?.count || 0;
  
  return { orders, total };
}

export async function updateVendingOrderStatus(orderId: number, data: {
  status?: string;
  adminNotes?: string;
  estimatedDelivery?: Date;
  installationDate?: Date;
  amountPaidCents?: number;
  remainingBalanceCents?: number;
  paymentsMade?: number;
  nextPaymentDue?: Date;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripePaymentIntentId?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(vendingMachineOrders)
    .set(data as any)
    .where(eq(vendingMachineOrders.id, orderId));
  
  return { success: true };
}

export async function recordVendingPayment(data: Omit<InsertVendingPaymentHistory, "id" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(vendingPaymentHistory).values(data);
  return { id: Number(result[0].insertId) };
}

export async function getVendingPaymentHistory(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(vendingPaymentHistory)
    .where(eq(vendingPaymentHistory.orderId, orderId))
    .orderBy(desc(vendingPaymentHistory.createdAt));
}


/**
 * Get public distributor profile by distributor code (for cloned pages)
 */
export async function getDistributorPublicProfile(code: string) {
  console.log('[getDistributorPublicProfile] Looking for code:', code);
  const db = await getDb();
  if (!db) {
    console.log('[getDistributorPublicProfile] No database connection');
    return null;
  }
  
  // Normalize the code to lowercase for vanity URL matching
  const normalizedCode = code.toLowerCase();
  
  // Try to find by distributor code first (case-sensitive for system codes)
  let [distributor] = await db.select()
    .from(distributors)
    .where(eq(distributors.distributorCode, code));
  console.log('[getDistributorPublicProfile] Found by code:', distributor ? 'yes' : 'no');
  
  // If not found, try by username
  if (!distributor) {
    [distributor] = await db.select()
      .from(distributors)
      .where(eq(distributors.username, code));
  }
  
  // If not found, try by subdomain
  if (!distributor) {
    [distributor] = await db.select()
      .from(distributors)
      .where(eq(distributors.subdomain, code));
  }
  
  // If not found, try by custom vanity URL slug in userProfiles
  if (!distributor) {
    const [profileWithSlug] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.customSlug, normalizedCode));
    
    if (profileWithSlug && profileWithSlug.userType === 'distributor') {
      [distributor] = await db.select()
        .from(distributors)
        .where(eq(distributors.userId, profileWithSlug.userId));
      console.log('[getDistributorPublicProfile] Found by vanity slug:', distributor ? 'yes' : 'no');
    }
  }
  
  // Show page for all distributors with active status (not suspended)
  // isActive field is for monthly qualification, not account status
  console.log('[getDistributorPublicProfile] Distributor status:', distributor?.status);
  if (!distributor || distributor.status === 'suspended') {
    console.log('[getDistributorPublicProfile] Returning null - no distributor or suspended');
    return null;
  }
  
  console.log('[getDistributorPublicProfile] Getting profile for userId:', distributor.userId);
  
  // Get user profile for additional info
  let profile = null;
  try {
    const [profileResult] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, distributor.userId));
    profile = profileResult;
    console.log('[getDistributorPublicProfile] Profile found:', profile ? 'yes' : 'no');
  } catch (err) {
    console.log('[getDistributorPublicProfile] Profile query error:', err);
  }
  
  // Count total customers (orders attributed to this distributor)
  let totalCustomers = 0;
  try {
    const customerCountResult = await db.select({
      count: sql<number>`COUNT(DISTINCT customerId)`
    })
      .from(sales)
      .where(eq(sales.distributorId, distributor.id));
    totalCustomers = customerCountResult[0]?.count || 0;
    console.log('[getDistributorPublicProfile] Total customers:', totalCustomers);
  } catch (err) {
    console.log('[getDistributorPublicProfile] Customer count error:', err);
  }
  
  const result = {
    id: distributor.id,
    distributorCode: distributor.distributorCode,
    username: distributor.username || distributor.distributorCode,
    displayName: profile?.displayName || distributor.username || `NEON Distributor ${distributor.distributorCode}`,
    profilePhoto: profile?.profilePhotoUrl || null,
    location: profile?.location || null,
    country: distributor.country || profile?.country || null,
    bio: profile?.bio || null,
    rank: distributor.rank || 'starter',
    joinDate: distributor.createdAt?.toISOString() || new Date().toISOString(),
    totalCustomers: totalCustomers,
    isActive: distributor.isActive === 1,
    // Social media links
    instagram: profile?.instagram || null,
    tiktok: profile?.tiktok || null,
    facebook: profile?.facebook || null,
    twitter: profile?.twitter || null,
    youtube: profile?.youtube || null,
    linkedin: profile?.linkedin || null,
  };
  console.log('[getDistributorPublicProfile] Returning:', JSON.stringify(result));
  return result;
}


/**
 * Get public leaderboard of top distributors for cloned websites
 */
export async function getPublicLeaderboard(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];
  
  try {
    // Get top distributors by rank and performance
    const topDistributors = await db.select({
      id: distributors.id,
      distributorCode: distributors.distributorCode,
      username: distributors.username,
      rank: distributors.rank,
      teamSales: distributors.teamSales,
      monthlyPV: distributors.monthlyPV,
      totalEarnings: distributors.totalEarnings,
      leftLegVolume: distributors.leftLegVolume,
      rightLegVolume: distributors.rightLegVolume,
      activeDownlineCount: distributors.activeDownlineCount,
      userId: distributors.userId,
    })
      .from(distributors)
      .where(eq(distributors.status, 'active'))
      .orderBy(
        desc(distributors.totalEarnings),
        desc(distributors.teamSales),
        desc(distributors.monthlyPV)
      )
      .limit(limit);
    
    // Get profile info for each distributor
    const leaderboard = await Promise.all(
      topDistributors.map(async (dist, index) => {
        let profile = null;
        try {
          const [profileResult] = await db.select()
            .from(userProfiles)
            .where(eq(userProfiles.userId, dist.userId));
          profile = profileResult;
        } catch (err) {
          // Profile not found, use defaults
        }
        
        return {
          position: index + 1,
          displayName: profile?.displayName || dist.username || `Distributor ${dist.distributorCode.slice(-4)}`,
          profilePhoto: profile?.profilePhotoUrl || null,
          location: profile?.location || null,
          rank: dist.rank || 'starter',
          teamSize: dist.activeDownlineCount || 0,
          monthlyVolume: dist.monthlyPV || 0,
          // Don't expose exact earnings, show tier instead
          earningsTier: getEarningsTier(dist.totalEarnings || 0),
        };
      })
    );
    
    return leaderboard;
  } catch (err) {
    console.error('[getPublicLeaderboard] Error:', err);
    return [];
  }
}

// Helper to convert earnings to a tier (for privacy)
function getEarningsTier(earnings: number): string {
  if (earnings >= 100000) return 'Diamond';
  if (earnings >= 50000) return 'Platinum';
  if (earnings >= 25000) return 'Gold';
  if (earnings >= 10000) return 'Silver';
  if (earnings >= 5000) return 'Bronze';
  return 'Rising Star';
}


// ==================== DISTRIBUTOR APPLICATION INFO ====================

/**
 * Update distributor application info (phone, address, tax info, agreements)
 */
export async function updateDistributorApplicationInfo(
  distributorId: number,
  data: {
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    dateOfBirth?: string;
    taxIdLast4?: string;
    agreedToPolicies?: boolean;
    agreedToTerms?: boolean;
    agreedAt?: Date;
  }
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  try {
    // Store application info in the distributors table or a related table
    // For now, we'll store key fields in the existing distributor record
    // and log the agreement for compliance
    await db.update(distributors)
      .set({
        phone: data.phone || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zipCode || null,
        dateOfBirth: data.dateOfBirth || null,
        taxIdLast4: data.taxIdLast4 || null,
        agreedToPoliciesAt: data.agreedToPolicies ? (data.agreedAt || new Date()) : null,
        agreedToTermsAt: data.agreedToTerms ? (data.agreedAt || new Date()) : null,
        updatedAt: new Date(),
      })
      .where(eq(distributors.id, distributorId));
    
    return true;
  } catch (err) {
    console.error('[updateDistributorApplicationInfo] Error:', err);
    return false;
  }
}

// ==================== VENDING NETWORK FUNCTIONS ====================

/**
 * Register a vending machine in the network
 */
export async function registerVendingMachine(data: {
  machineId: string;
  ownerId: number;
  referrerId?: number;
  location: string;
}): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;

  // Calculate network level based on referrer
  let networkLevel = 0;
  if (data.referrerId) {
    const referrerMachines = await db
      .select({ level: vendingNetwork.networkLevel })
      .from(vendingNetwork)
      .where(eq(vendingNetwork.ownerId, data.referrerId))
      .limit(1);
    if (referrerMachines.length > 0) {
      networkLevel = referrerMachines[0].level + 1;
    }
  }

  const result = await db.insert(vendingNetwork).values({
    machineId: data.machineId,
    ownerId: data.ownerId,
    referrerId: data.referrerId || null,
    location: data.location,
    networkLevel,
    status: "active",
    monthlyRevenue: 0,
    totalSales: 0,
    commissionVolume: 0,
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Get vending machines owned by a user
 */
export async function getUserVendingMachines(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(vendingNetwork)
    .where(eq(vendingNetwork.ownerId, userId))
    .orderBy(desc(vendingNetwork.createdAt));
}

/**
 * Get vending network tree for a user (machines they referred)
 */
export async function getVendingNetworkTree(userId: number, maxDepth: number = 5) {
  const db = await getDb();
  if (!db) return [];

  // Get all machines where this user is the referrer
  const directReferrals = await db
    .select()
    .from(vendingNetwork)
    .where(eq(vendingNetwork.referrerId, userId));

  // Recursively build tree
  const buildTree = async (machines: typeof directReferrals, depth: number): Promise<any[]> => {
    if (depth >= maxDepth) return machines;

    return Promise.all(
      machines.map(async (machine) => {
        const children = await db
          .select()
          .from(vendingNetwork)
          .where(eq(vendingNetwork.referrerId, machine.ownerId));

        return {
          ...machine,
          referrals: children.length > 0 ? await buildTree(children, depth + 1) : [],
        };
      })
    );
  };

  return buildTree(directReferrals, 0);
}

/**
 * Update vending machine revenue and CV
 */
export async function updateVendingMachineRevenue(
  machineId: string,
  monthlyRevenue: number,
  totalSales: number,
  commissionVolume: number
) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(vendingNetwork)
    .set({
      monthlyRevenue,
      totalSales,
      commissionVolume,
    })
    .where(eq(vendingNetwork.machineId, machineId));
}

/**
 * Calculate vending network stats for a user
 */
export async function getVendingNetworkStats(userId: number) {
  const db = await getDb();
  if (!db) return null;

  // Get direct machines
  const directMachines = await db
    .select()
    .from(vendingNetwork)
    .where(eq(vendingNetwork.referrerId, userId));

  // Calculate totals
  let totalNetworkCV = 0;
  let totalNetworkRevenue = 0;
  let totalMachines = directMachines.length;

  for (const machine of directMachines) {
    totalNetworkCV += machine.commissionVolume;
    totalNetworkRevenue += machine.monthlyRevenue;
  }

  // Get all downstream machines (recursive)
  const getAllDownstream = async (referrerId: number): Promise<typeof directMachines> => {
    const machines = await db
      .select()
      .from(vendingNetwork)
      .where(eq(vendingNetwork.referrerId, referrerId));

    let allMachines = [...machines];
    for (const machine of machines) {
      const downstream = await getAllDownstream(machine.ownerId);
      allMachines = [...allMachines, ...downstream];
    }
    return allMachines;
  };

  // Get all downstream for CV calculation
  for (const machine of directMachines) {
    const downstream = await getAllDownstream(machine.ownerId);
    totalMachines += downstream.length;
    for (const dm of downstream) {
      totalNetworkCV += dm.commissionVolume;
      totalNetworkRevenue += dm.monthlyRevenue;
    }
  }

  // Calculate commissions (10% direct referral, 5% network CV)
  const directReferralCommission = Math.floor(
    directMachines.reduce((sum, m) => sum + m.monthlyRevenue, 0) * 0.10
  );
  const networkCommission = Math.floor(totalNetworkCV * 0.05);

  return {
    totalMachines,
    totalNetworkCV,
    totalNetworkRevenue,
    directReferralCommission,
    networkCommission,
    directMachinesCount: directMachines.length,
  };
}

/**
 * Record a vending commission
 */
export async function recordVendingCommission(data: {
  userId: number;
  sourceMachineId?: number;
  commissionType: "direct_referral" | "network_cv" | "bonus";
  amountCents: number;
  cvAmount: number;
  commissionRate: number;
  periodStart: Date;
  periodEnd: Date;
}): Promise<{ id: number } | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(vendingCommissions).values({
    userId: data.userId,
    sourceMachineId: data.sourceMachineId || null,
    commissionType: data.commissionType,
    amountCents: data.amountCents,
    cvAmount: data.cvAmount,
    commissionRate: data.commissionRate,
    periodStart: data.periodStart,
    periodEnd: data.periodEnd,
    status: "pending",
  });

  // Create notification for the user
  await createNotification({
    userId: data.userId,
    type: "commission",
    title: "Vending Commission Earned",
    message: `You earned $${(data.amountCents / 100).toFixed(2)} from your vending network!`,
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Get vending commissions for a user
 */
export async function getVendingCommissions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(vendingCommissions)
    .where(eq(vendingCommissions.userId, userId))
    .orderBy(desc(vendingCommissions.createdAt))
    .limit(limit);
}

/**
 * Get total vending earnings for a user
 */
export async function getTotalVendingEarnings(userId: number) {
  const db = await getDb();
  if (!db) return { total: 0, pending: 0, paid: 0 };

  const commissions = await db
    .select()
    .from(vendingCommissions)
    .where(eq(vendingCommissions.userId, userId));

  let total = 0;
  let pending = 0;
  let paid = 0;

  for (const c of commissions) {
    total += c.amountCents;
    if (c.status === "pending" || c.status === "approved") {
      pending += c.amountCents;
    } else if (c.status === "paid") {
      paid += c.amountCents;
    }
  }

  return { total, pending, paid };
}


// ============================================
// Notification Preferences Functions
// ============================================

/**
 * Get notification preferences for a user
 */
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (result[0]) {
    return result[0];
  }

  // Return default preferences if none exist
  return {
    userId,
    referrals: true,
    commissions: true,
    teamUpdates: true,
    promotions: true,
    orders: true,
    announcements: true,
    digestFrequency: "none" as const,
    digestDay: 1,
    digestHour: 9,
    lastDigestSent: null,
  };
}

/**
 * Update notification preferences for a user
 */
export async function updateNotificationPreferences(
  userId: number,
  preferences: {
    referrals?: boolean;
    commissions?: boolean;
    teamUpdates?: boolean;
    promotions?: boolean;
    orders?: boolean;
    announcements?: boolean;
    digestFrequency?: "none" | "daily" | "weekly";
    digestDay?: number;
    digestHour?: number;
  }
) {
  const db = await getDb();
  if (!db) return null;

  // Check if preferences exist
  const existing = await db
    .select({ id: notificationPreferences.id })
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (existing[0]) {
    // Update existing preferences
    await db
      .update(notificationPreferences)
      .set({
        ...preferences,
        updatedAt: new Date(),
      })
      .where(eq(notificationPreferences.userId, userId));
  } else {
    // Create new preferences
    await db.insert(notificationPreferences).values({
      userId,
      referrals: preferences.referrals ?? true,
      commissions: preferences.commissions ?? true,
      teamUpdates: preferences.teamUpdates ?? true,
      promotions: preferences.promotions ?? true,
      orders: preferences.orders ?? true,
      announcements: preferences.announcements ?? true,
      digestFrequency: preferences.digestFrequency ?? "none",
      digestDay: preferences.digestDay ?? 1,
      digestHour: preferences.digestHour ?? 9,
    });
  }

  return { success: true };
}

/**
 * Check if a notification type is enabled for a user
 */
export async function isNotificationEnabled(
  userId: number,
  notificationType: "referrals" | "commissions" | "teamUpdates" | "promotions" | "orders" | "announcements"
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  if (!prefs) return true; // Default to enabled
  return prefs[notificationType] ?? true;
}

/**
 * Add item to email digest queue
 */
export async function addToDigestQueue(data: {
  userId: number;
  notificationType: string;
  title: string;
  content: string;
  relatedId?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(emailDigestQueue).values({
    userId: data.userId,
    notificationType: data.notificationType,
    title: data.title,
    content: data.content,
    relatedId: data.relatedId || null,
    processed: false,
  });

  return { id: Number(result[0].insertId) };
}

/**
 * Get pending digest items for a user
 */
export async function getPendingDigestItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(emailDigestQueue)
    .where(
      and(
        eq(emailDigestQueue.userId, userId),
        eq(emailDigestQueue.processed, false)
      )
    )
    .orderBy(emailDigestQueue.createdAt);
}

/**
 * Mark digest items as processed
 */
export async function markDigestItemsProcessed(itemIds: number[]) {
  const db = await getDb();
  if (!db || itemIds.length === 0) return;

  for (const id of itemIds) {
    await db
      .update(emailDigestQueue)
      .set({ processed: true })
      .where(eq(emailDigestQueue.id, id));
  }
}

/**
 * Update last digest sent timestamp
 */
export async function updateLastDigestSent(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db
    .update(notificationPreferences)
    .set({ lastDigestSent: new Date() })
    .where(eq(notificationPreferences.userId, userId));
}

/**
 * Get users due for digest email
 */
export async function getUsersDueForDigest(frequency: "daily" | "weekly") {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const currentHour = now.getHours();
  const currentDay = now.getDay();

  // Get users with matching digest frequency
  const users = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.digestFrequency, frequency));

  // Filter by time preferences
  return users.filter((user) => {
    // Check if it's the right hour
    if (user.digestHour !== currentHour) return false;

    // For weekly, check if it's the right day
    if (frequency === "weekly" && user.digestDay !== currentDay) return false;

    // Check if we haven't sent a digest recently
    if (user.lastDigestSent) {
      const hoursSinceLastDigest =
        (now.getTime() - new Date(user.lastDigestSent).getTime()) / (1000 * 60 * 60);
      if (frequency === "daily" && hoursSinceLastDigest < 20) return false;
      if (frequency === "weekly" && hoursSinceLastDigest < 160) return false;
    }

    return true;
  });
}


// ============ Territory Reservation Functions ============

import { territoryReservations, InsertTerritoryReservation } from "../drizzle/schema";

/**
 * Create a new territory reservation (48-hour hold)
 */
export async function createTerritoryReservation(data: Omit<InsertTerritoryReservation, 'expiresAt' | 'status'>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check for existing active reservation for this user
  const existingUserReservation = await db.select().from(territoryReservations)
    .where(and(
      eq(territoryReservations.userId, data.userId),
      eq(territoryReservations.status, "active")
    ));
  
  if (existingUserReservation.length > 0) {
    throw new Error("You already have an active territory reservation. Please complete or cancel it first.");
  }
  
  // Check for overlapping reservations in the same area
  const overlapping = await db.select().from(territoryReservations)
    .where(and(
      eq(territoryReservations.status, "active"),
      eq(territoryReservations.state, data.state)
    ));
  
  // Simple overlap check based on center distance and radius
  for (const existing of overlapping) {
    const existingLat = parseFloat(existing.centerLat as unknown as string);
    const existingLng = parseFloat(existing.centerLng as unknown as string);
    const existingRadius = parseFloat(existing.radiusMiles as unknown as string);
    const newLat = parseFloat(data.centerLat as unknown as string);
    const newLng = parseFloat(data.centerLng as unknown as string);
    const newRadius = parseFloat(data.radiusMiles as unknown as string);
    
    // Calculate distance between centers (simplified)
    const latDiff = Math.abs(existingLat - newLat);
    const lngDiff = Math.abs(existingLng - newLng);
    const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 69; // Rough miles conversion
    
    if (distance < (existingRadius + newRadius)) {
      throw new Error("This territory overlaps with an existing reservation. Please select a different area.");
    }
  }
  
  // Set expiration to 48 hours from now
  const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  
  const result = await db.insert(territoryReservations).values({
    ...data,
    expiresAt,
    status: "active",
  });
  
  return { 
    success: true, 
    reservationId: result[0].insertId,
    expiresAt,
  };
}

/**
 * Get user's active territory reservation
 */
export async function getUserActiveReservation(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // First, expire any old reservations
  await expireOldReservations();
  
  const result = await db.select().from(territoryReservations)
    .where(and(
      eq(territoryReservations.userId, userId),
      eq(territoryReservations.status, "active")
    ))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get all active territory reservations (for map display)
 */
export async function getActiveReservations() {
  const db = await getDb();
  if (!db) return [];
  
  // First, expire any old reservations
  await expireOldReservations();
  
  return await db.select().from(territoryReservations)
    .where(eq(territoryReservations.status, "active"));
}

/**
 * Cancel a territory reservation
 */
export async function cancelTerritoryReservation(userId: number, reservationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const reservation = await db.select().from(territoryReservations)
    .where(and(
      eq(territoryReservations.id, reservationId),
      eq(territoryReservations.userId, userId)
    ))
    .limit(1);
  
  if (!reservation[0]) {
    throw new Error("Reservation not found");
  }
  
  if (reservation[0].status !== "active") {
    throw new Error("Reservation is no longer active");
  }
  
  await db.update(territoryReservations)
    .set({ status: "cancelled" })
    .where(eq(territoryReservations.id, reservationId));
  
  return { success: true };
}

/**
 * Convert reservation to license application
 */
export async function convertReservationToLicense(userId: number, reservationId: number, licenseId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(territoryReservations)
    .set({ 
      status: "converted",
      convertedToLicenseId: licenseId,
    })
    .where(and(
      eq(territoryReservations.id, reservationId),
      eq(territoryReservations.userId, userId)
    ));
  
  return { success: true };
}

/**
 * Expire old reservations (called automatically)
 */
export async function expireOldReservations() {
  const db = await getDb();
  if (!db) return;
  
  const now = new Date();
  
  await db.update(territoryReservations)
    .set({ status: "expired" })
    .where(and(
      eq(territoryReservations.status, "active"),
      lt(territoryReservations.expiresAt, now)
    ));
}

/**
 * Get reservations expiring soon (for reminder emails)
 */
export async function getExpiringReservations(hoursBeforeExpiry: number = 6) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const threshold = new Date(now.getTime() + hoursBeforeExpiry * 60 * 60 * 1000);
  
  return await db.select().from(territoryReservations)
    .where(and(
      eq(territoryReservations.status, "active"),
      eq(territoryReservations.reminderSent, false),
      lt(territoryReservations.expiresAt, threshold),
      gt(territoryReservations.expiresAt, now)
    ));
}

/**
 * Mark reminder as sent
 */
export async function markReservationReminderSent(reservationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(territoryReservations)
    .set({ reminderSent: true })
    .where(eq(territoryReservations.id, reservationId));
  
  return { success: true };
}

/**
 * Get reservation by ID
 */
export async function getReservationById(reservationId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(territoryReservations)
    .where(eq(territoryReservations.id, reservationId))
    .limit(1);
  
  return result[0] || null;
}


// ============ MFA (Multi-Factor Authentication) Functions ============

/**
 * Get MFA settings for a user
 */
export async function getMfaSettings(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(mfaSettings)
    .where(eq(mfaSettings.userId, userId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Create or update MFA settings
 */
export async function createOrUpdateMfaSettings(userId: number, data: {
  totpSecret: string;
  isEnabled: boolean;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getMfaSettings(userId);
  
  if (existing) {
    await db.update(mfaSettings)
      .set({
        totpSecret: data.totpSecret,
        isEnabled: data.isEnabled,
      })
      .where(eq(mfaSettings.userId, userId));
  } else {
    await db.insert(mfaSettings).values({
      userId,
      totpSecret: data.totpSecret,
      isEnabled: data.isEnabled,
      backupCodesRemaining: 10,
    });
  }
  
  return { success: true };
}

/**
 * Enable MFA for a user
 */
export async function enableMfa(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mfaSettings)
    .set({
      isEnabled: true,
      lastVerifiedAt: new Date(),
    })
    .where(eq(mfaSettings.userId, userId));
  
  return { success: true };
}

/**
 * Disable MFA for a user
 */
export async function disableMfa(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mfaSettings)
    .set({
      isEnabled: false,
      totpSecret: '',
      backupCodes: null,
      backupCodesRemaining: 0,
    })
    .where(eq(mfaSettings.userId, userId));
  
  return { success: true };
}

/**
 * Generate backup codes for MFA
 */
export async function generateBackupCodes(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Generate 10 random backup codes
  const codes: string[] = [];
  const hashedCodes: string[] = [];
  
  for (let i = 0; i < 10; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(code);
    hashedCodes.push(crypto.createHash('sha256').update(code).digest('hex'));
  }
  
  await db.update(mfaSettings)
    .set({
      backupCodes: JSON.stringify(hashedCodes),
      backupCodesRemaining: 10,
    })
    .where(eq(mfaSettings.userId, userId));
  
  return codes;
}

/**
 * Verify a backup code
 */
export async function verifyBackupCode(userId: number, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  
  const settings = await getMfaSettings(userId);
  if (!settings?.backupCodes) return false;
  
  const hashedCodes: string[] = JSON.parse(settings.backupCodes);
  const inputHash = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');
  
  const codeIndex = hashedCodes.indexOf(inputHash);
  if (codeIndex === -1) return false;
  
  // Remove used code
  hashedCodes.splice(codeIndex, 1);
  
  await db.update(mfaSettings)
    .set({
      backupCodes: JSON.stringify(hashedCodes),
      backupCodesRemaining: hashedCodes.length,
    })
    .where(eq(mfaSettings.userId, userId));
  
  return true;
}

/**
 * Record successful MFA verification
 */
export async function recordMfaVerification(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(mfaSettings)
    .set({
      lastVerifiedAt: new Date(),
      failedAttempts: 0,
    })
    .where(eq(mfaSettings.userId, userId));
}

/**
 * Get remaining backup codes count
 */
export async function getBackupCodesRemaining(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const settings = await db.select()
    .from(mfaSettings)
    .where(eq(mfaSettings.userId, userId))
    .limit(1);
  
  return settings[0]?.backupCodesRemaining || 0;
}


// ============ MFA Recovery Functions ============

/**
 * Create an MFA recovery request
 */
export async function createMfaRecoveryRequest(data: {
  userId: number;
  email: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<{ id: number; recoveryToken: string } | null> {
  const db = await getDb();
  if (!db) return null;
  
  // Generate secure recovery token
  const recoveryToken = crypto.randomBytes(32).toString('hex');
  
  // Token expires in 24 hours
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 24);
  
  const result = await db.insert(mfaRecoveryRequests).values({
    userId: data.userId,
    email: data.email,
    recoveryToken,
    tokenExpiry,
    ipAddress: data.ipAddress || null,
    userAgent: data.userAgent || null,
    status: 'pending',
  });
  
  const insertId = (result as any)[0]?.insertId;
  return { id: insertId, recoveryToken };
}

/**
 * Get MFA recovery request by token
 */
export async function getMfaRecoveryByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select()
    .from(mfaRecoveryRequests)
    .where(eq(mfaRecoveryRequests.recoveryToken, token))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

/**
 * Update MFA recovery request status
 */
export async function updateMfaRecoveryStatus(
  id: number,
  status: 'pending' | 'email_verified' | 'approved' | 'rejected' | 'completed' | 'expired',
  adminNotes?: string,
  processedBy?: number
) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(mfaRecoveryRequests)
    .set({
      status,
      adminNotes: adminNotes || null,
      processedBy: processedBy || null,
    })
    .where(eq(mfaRecoveryRequests.id, id));
}

/**
 * Submit verification answers for recovery
 */
export async function submitRecoveryVerification(
  id: number,
  answers: Record<string, string>
) {
  const db = await getDb();
  if (!db) return;
  
  await db.update(mfaRecoveryRequests)
    .set({
      verificationAnswers: JSON.stringify(answers),
      status: 'email_verified',
    })
    .where(eq(mfaRecoveryRequests.id, id));
}

/**
 * Get pending MFA recovery requests for admin review
 */
export async function getPendingMfaRecoveryRequests() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select({
    id: mfaRecoveryRequests.id,
    userId: mfaRecoveryRequests.userId,
    email: mfaRecoveryRequests.email,
    status: mfaRecoveryRequests.status,
    verificationAnswers: mfaRecoveryRequests.verificationAnswers,
    ipAddress: mfaRecoveryRequests.ipAddress,
    createdAt: mfaRecoveryRequests.createdAt,
  })
    .from(mfaRecoveryRequests)
    .where(eq(mfaRecoveryRequests.status, 'email_verified'))
    .orderBy(desc(mfaRecoveryRequests.createdAt));
}

/**
 * Complete MFA recovery - disable MFA for user
 */
export async function completeMfaRecovery(recoveryId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  // Disable MFA for the user
  await db.update(mfaSettings)
    .set({
      isEnabled: false,
      totpSecret: '',
      backupCodes: null,
      backupCodesRemaining: 0,
    })
    .where(eq(mfaSettings.userId, userId));
  
  // Mark recovery as completed
  await db.update(mfaRecoveryRequests)
    .set({ status: 'completed' })
    .where(eq(mfaRecoveryRequests.id, recoveryId));
  
  return true;
}

/**
 * Get user's recovery request history
 */
export async function getUserRecoveryHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select()
    .from(mfaRecoveryRequests)
    .where(eq(mfaRecoveryRequests.userId, userId))
    .orderBy(desc(mfaRecoveryRequests.createdAt))
    .limit(10);
}


// ============ Vending Machine IoT Functions ============

/**
 * Get all vending machines for a user (IoT dashboard)
 */
export async function getUserVendingMachinesIot(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(vendingMachines)
    .where(eq(vendingMachines.ownerId, userId))
    .orderBy(desc(vendingMachines.createdAt));
}

/**
 * Get vending machine by ID
 */
export async function getVendingMachineById(machineId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(vendingMachines)
    .where(eq(vendingMachines.id, machineId))
    .limit(1);
  
  return result[0] || null;
}

/**
 * Get machine inventory
 */
export async function getVendingMachineInventory(machineId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(vendingInventory)
    .where(eq(vendingInventory.machineId, machineId))
    .orderBy(vendingInventory.slotNumber);
}

/**
 * Get machine sales history
 */
export async function getVendingMachineSales(machineId: number, options?: {
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(vendingSales.machineId, machineId)];
  
  if (options?.startDate) {
    conditions.push(gte(vendingSales.createdAt, options.startDate));
  }
  if (options?.endDate) {
    conditions.push(lt(vendingSales.createdAt, options.endDate));
  }
  
  return await db.select().from(vendingSales)
    .where(and(...conditions))
    .orderBy(desc(vendingSales.createdAt))
    .limit(options?.limit || 100);
}

/**
 * Get vending alerts for a user
 */
export async function getVendingAlerts(userId: number, machineId?: number, unacknowledgedOnly?: boolean) {
  const db = await getDb();
  if (!db) return [];
  
  // Get user's machines first
  const userMachines = await db.select({ id: vendingMachines.id })
    .from(vendingMachines)
    .where(eq(vendingMachines.ownerId, userId));
  
  const machineIds = userMachines.map(m => m.id);
  if (machineIds.length === 0) return [];
  
  let conditions: any[] = [];
  
  if (machineId) {
    conditions.push(eq(vendingAlerts.machineId, machineId));
  } else {
    conditions.push(sql`${vendingAlerts.machineId} IN (${sql.join(machineIds.map(id => sql`${id}`), sql`, `)})`);
  }
  
  if (unacknowledgedOnly) {
    conditions.push(eq(vendingAlerts.acknowledged, false));
  }
  
  return await db.select().from(vendingAlerts)
    .where(and(...conditions))
    .orderBy(desc(vendingAlerts.createdAt))
    .limit(100);
}

/**
 * Acknowledge a vending alert
 */
export async function acknowledgeVendingAlert(alertId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(vendingAlerts)
    .set({
      acknowledged: true,
      acknowledgedBy: userId,
      acknowledgedAt: new Date(),
    })
    .where(eq(vendingAlerts.id, alertId));
  
  return { success: true };
}

/**
 * Create a maintenance request
 */
export async function createMaintenanceRequest(data: {
  machineId: number;
  requesterId: number;
  requestType: "repair" | "restock" | "cleaning" | "inspection" | "relocation" | "upgrade";
  priority: "low" | "medium" | "high" | "urgent";
  title: string;
  description?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(maintenanceRequests).values({
    machineId: data.machineId,
    requesterId: data.requesterId,
    requestType: data.requestType,
    priority: data.priority,
    title: data.title,
    description: data.description || null,
    status: "pending",
  });
  
  return { id: Number(result[0].insertId) };
}

/**
 * Get maintenance requests
 */
export async function getMaintenanceRequests(userId: number, machineId?: number, status?: string) {
  const db = await getDb();
  if (!db) return [];
  
  // Get user's machines
  const userMachines = await db.select({ id: vendingMachines.id })
    .from(vendingMachines)
    .where(eq(vendingMachines.ownerId, userId));
  
  const machineIds = userMachines.map(m => m.id);
  if (machineIds.length === 0) return [];
  
  let conditions: any[] = [];
  
  if (machineId) {
    conditions.push(eq(maintenanceRequests.machineId, machineId));
  } else {
    conditions.push(sql`${maintenanceRequests.machineId} IN (${sql.join(machineIds.map(id => sql`${id}`), sql`, `)})`);
  }
  
  if (status && status !== "all") {
    conditions.push(eq(maintenanceRequests.status, status as any));
  }
  
  return await db.select().from(maintenanceRequests)
    .where(and(...conditions))
    .orderBy(desc(maintenanceRequests.createdAt))
    .limit(50);
}

/**
 * Get vending dashboard summary
 */
export async function getVendingDashboardSummary(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  // Get all user's machines
  const machines = await db.select().from(vendingMachines)
    .where(eq(vendingMachines.ownerId, userId));
  
  if (machines.length === 0) {
    return {
      totalMachines: 0,
      onlineMachines: 0,
      offlineMachines: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      totalSales: 0,
      todaySales: 0,
      activeAlerts: 0,
      pendingMaintenance: 0,
      lowStockSlots: 0,
    };
  }
  
  const machineIds = machines.map(m => m.id);
  
  // Count online/offline
  const onlineMachines = machines.filter(m => m.status === "online").length;
  const offlineMachines = machines.filter(m => m.status !== "online").length;
  
  // Sum revenue and sales
  const totalRevenue = machines.reduce((sum, m) => sum + (m.totalRevenue || 0), 0);
  const todayRevenue = machines.reduce((sum, m) => sum + (m.todayRevenue || 0), 0);
  const totalSales = machines.reduce((sum, m) => sum + (m.totalSalesCount || 0), 0);
  const todaySales = machines.reduce((sum, m) => sum + (m.todaySalesCount || 0), 0);
  
  // Count active alerts
  const alertsResult = await db.select({ count: sql<number>`count(*)` })
    .from(vendingAlerts)
    .where(and(
      sql`${vendingAlerts.machineId} IN (${sql.join(machineIds.map(id => sql`${id}`), sql`, `)})`,
      eq(vendingAlerts.acknowledged, false)
    ));
  const activeAlerts = alertsResult[0]?.count || 0;
  
  // Count pending maintenance
  const maintenanceResult = await db.select({ count: sql<number>`count(*)` })
    .from(maintenanceRequests)
    .where(and(
      sql`${maintenanceRequests.machineId} IN (${sql.join(machineIds.map(id => sql`${id}`), sql`, `)})`,
      eq(maintenanceRequests.status, "pending")
    ));
  const pendingMaintenance = maintenanceResult[0]?.count || 0;
  
  // Count low stock slots
  const inventoryResult = await db.select({ count: sql<number>`count(*)` })
    .from(vendingInventory)
    .where(and(
      sql`${vendingInventory.machineId} IN (${sql.join(machineIds.map(id => sql`${id}`), sql`, `)})`,
      sql`${vendingInventory.currentStock} <= ${vendingInventory.lowStockThreshold}`
    ));
  const lowStockSlots = inventoryResult[0]?.count || 0;
  
  return {
    totalMachines: machines.length,
    onlineMachines,
    offlineMachines,
    totalRevenue,
    todayRevenue,
    totalSales,
    todaySales,
    activeAlerts,
    pendingMaintenance,
    lowStockSlots,
  };
}

/**
 * Get vending analytics
 */
export async function getVendingAnalytics(userId: number, machineId?: number, period: "day" | "week" | "month" | "year" = "week") {
  const db = await getDb();
  if (!db) return null;
  
  // Get user's machines
  const machines = await db.select().from(vendingMachines)
    .where(eq(vendingMachines.ownerId, userId));
  
  if (machines.length === 0) {
    return {
      salesByHour: [],
      salesByProduct: [],
      revenueByDay: [],
      topProducts: [],
    };
  }
  
  const machineIds = machineId ? [machineId] : machines.map(m => m.id);
  
  // Calculate date range
  const now = new Date();
  let startDate: Date;
  switch (period) {
    case "day":
      startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case "week":
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case "month":
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case "year":
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
  }
  
  // Get sales in the period
  const sales = await db.select().from(vendingSales)
    .where(and(
      sql`${vendingSales.machineId} IN (${sql.join(machineIds.map(id => sql`${id}`), sql`, `)})`,
      gte(vendingSales.createdAt, startDate)
    ))
    .orderBy(vendingSales.createdAt);
  
  // Aggregate by hour
  const salesByHour: { hour: number; count: number; revenue: number }[] = [];
  for (let h = 0; h < 24; h++) {
    const hourSales = sales.filter(s => new Date(s.createdAt!).getHours() === h);
    salesByHour.push({
      hour: h,
      count: hourSales.length,
      revenue: hourSales.reduce((sum, s) => sum + (s.amountInCents || 0), 0),
    });
  }
  
  // Aggregate by product
  const productMap = new Map<string, { count: number; revenue: number }>();
  for (const sale of sales) {
    const existing = productMap.get(sale.productName) || { count: 0, revenue: 0 };
    productMap.set(sale.productName, {
      count: existing.count + (sale.quantity || 1),
      revenue: existing.revenue + (sale.amountInCents || 0),
    });
  }
  
  const salesByProduct = Array.from(productMap.entries()).map(([name, data]) => ({
    productName: name,
    count: data.count,
    revenue: data.revenue,
  })).sort((a, b) => b.revenue - a.revenue);
  
  const topProducts = salesByProduct.slice(0, 5);
  
  // Revenue by day
  const dayMap = new Map<string, number>();
  for (const sale of sales) {
    const day = new Date(sale.createdAt!).toISOString().split('T')[0];
    dayMap.set(day, (dayMap.get(day) || 0) + (sale.amountInCents || 0));
  }
  
  const revenueByDay = Array.from(dayMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
  
  return {
    salesByHour,
    salesByProduct,
    revenueByDay,
    topProducts,
  };
}
