import { desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertPreorder, InsertUser, InsertTerritoryLicense, InsertCrowdfunding, preorders, users, territoryLicenses, crowdfunding } from "../drizzle/schema";
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
