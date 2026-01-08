import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pre-orders table for NEON energy drink relaunch.
 * Stores customer information and order details.
 */
export const preorders = mysqlTable("preorders", {
  id: int("id").autoincrement().primaryKey(),
  /** Customer full name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Customer email address */
  email: varchar("email", { length: 320 }).notNull(),
  /** Customer phone number (optional) */
  phone: varchar("phone", { length: 50 }),
  /** Number of cases to pre-order (each case contains 24 cans) */
  quantity: int("quantity").notNull(),
  /** Delivery address */
  address: text("address").notNull(),
  /** City */
  city: varchar("city", { length: 100 }).notNull(),
  /** State/Province */
  state: varchar("state", { length: 100 }).notNull(),
  /** Postal/ZIP code */
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  /** Country */
  country: varchar("country", { length: 100 }).notNull().default("USA"),
  /** Order status */
  status: mysqlEnum("status", ["pending", "confirmed", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  /** Additional notes from customer */
  notes: text("notes"),
  /** Order creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Preorder = typeof preorders.$inferSelect;
export type InsertPreorder = typeof preorders.$inferInsert;

/**
 * Crowdfunding contributions table.
 * Tracks user contributions to the NEON relaunch campaign.
 */
export const crowdfunding = mysqlTable("crowdfunding", {
  id: int("id").autoincrement().primaryKey(),
  /** Contributor name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Contributor email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Contribution amount in USD */
  amount: int("amount").notNull(),
  /** Reward tier selected */
  rewardTier: varchar("rewardTier", { length: 100 }),
  /** Payment status */
  status: mysqlEnum("status", ["pending", "completed", "refunded"]).default("pending").notNull(),
  /** Additional message from contributor */
  message: text("message"),
  /** Contribution timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Crowdfunding = typeof crowdfunding.$inferSelect;
export type InsertCrowdfunding = typeof crowdfunding.$inferInsert;

/**
 * Territory licensing applications table.
 * Stores franchise territory licensing requests for vending machines.
 */
export const territoryLicenses = mysqlTable("territory_licenses", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (foreign key to users table) */
  userId: int("userId"),
  /** Applicant name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Applicant email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Applicant phone */
  phone: varchar("phone", { length: 50 }),
  /** Territory description (e.g., "Los Angeles County, CA") */
  territory: text("territory").notNull(),
  /** Territory coordinates (GeoJSON or similar) */
  coordinates: text("coordinates"),
  /** Territory size in square miles */
  squareMiles: int("squareMiles").notNull(),
  /** License term in months */
  termMonths: int("termMonths").notNull(),
  /** Price per square mile per month */
  pricePerSqMile: int("pricePerSqMile").notNull(),
  /** Total licensing cost */
  totalCost: int("totalCost").notNull(),
  /** Deposit amount paid */
  depositAmount: int("depositAmount"),
  /** Financing selected */
  financing: mysqlEnum("financing", ["full", "deposit", "monthly"]).default("full").notNull(),
  /** Application status */
  status: mysqlEnum("status", ["pending", "approved", "rejected", "active"]).default("pending").notNull(),
  /** Additional notes */
  notes: text("notes"),
  /** Application timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TerritoryLicense = typeof territoryLicenses.$inferSelect;
export type InsertTerritoryLicense = typeof territoryLicenses.$inferInsert;