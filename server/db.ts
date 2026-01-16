import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPreorder, InsertUser, InsertTerritoryLicense, InsertCrowdfunding, InsertNewsletterSubscription, preorders, users, territoryLicenses, crowdfunding, newsletterSubscriptions, distributors, sales, affiliateLinks, commissions } from "../drizzle/schema";
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
  return result;
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
