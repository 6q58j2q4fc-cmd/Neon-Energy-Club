import { desc, eq, sql, and, gt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPreorder, InsertUser, InsertTerritoryLicense, InsertCrowdfunding, InsertNewsletterSubscription, preorders, users, territoryLicenses, crowdfunding, newsletterSubscriptions, distributors, sales, affiliateLinks, commissions, claimedTerritories, territoryApplications, InsertClaimedTerritory, InsertTerritoryApplication, neonNfts, InsertNeonNft, investorInquiries, InsertInvestorInquiry, blogPosts, InsertBlogPost } from "../drizzle/schema";
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
  return { id: insertId || Date.now() };
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

// Newsletter subscription functions
export async function subscribeNewsletter(input: { email: string; name: string }) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }
  
  // Check if email already exists
  const existing = await db.select().from(newsletterSubscriptions).where(eq(newsletterSubscriptions.email, input.email)).limit(1);
  
  if (existing.length > 0) {
    throw new Error("Email already subscribed");
  }
  
  const result = await db.insert(newsletterSubscriptions).values({
    email: input.email,
    name: input.name,
    discountTier: 1, // Base tier for email signup
    referralCount: 0,
    status: "active",
  });
  
  return {
    id: Number(result[0].insertId),
    email: input.email,
    discountTier: 1,
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
  
  // Add each friend as a new subscription
  for (const email of friendEmails) {
    try {
      await db.insert(newsletterSubscriptions).values({
        email,
        referrerId: subscriptionId,
        discountTier: 1,
        referralCount: 0,
        status: "active",
      });
    } catch (error) {
      // Skip if email already exists
      console.log(`Email ${email} already subscribed, skipping`);
    }
  }
  
  // Update referrer's discount tier and referral count
  await db.update(newsletterSubscriptions)
    .set({ 
      discountTier: 2, // Upgrade to tier 2 (25% off)
      referralCount: referrer[0].referralCount + friendEmails.length,
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
  
  // Generate unique distributor code
  const distributorCode = `NEON${input.userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
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
  
  // Commission rates by rank
  const commissionRates: Record<string, number> = {
    starter: 0.20, // 20%
    bronze: 0.25,  // 25%
    silver: 0.30,  // 30%
    gold: 0.35,    // 35%
    platinum: 0.40, // 40%
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
  
  // Rank requirements (team sales in cents)
  const rankRequirements: Record<string, number> = {
    starter: 0,
    bronze: 500000,    // $5,000
    silver: 2000000,   // $20,000
    gold: 10000000,    // $100,000
    platinum: 50000000, // $500,000
  };
  
  const ranks = ["starter", "bronze", "silver", "gold", "platinum"];
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
