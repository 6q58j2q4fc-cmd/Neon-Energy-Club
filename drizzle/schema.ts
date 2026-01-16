import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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
/**
 * Distributors table for micro-franchising system.
 * Tracks distributor accounts, ranks, and sponsor relationships.
 */
export const distributors = mysqlTable("distributors", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (foreign key to users table) */
  userId: int("userId").notNull().unique(),
  /** Sponsor/upline distributor ID */
  sponsorId: int("sponsorId"),
  /** Unique distributor code for affiliate links */
  distributorCode: varchar("distributorCode", { length: 50 }).notNull().unique(),
  /** Current rank/level */
  rank: mysqlEnum("rank", ["starter", "bronze", "silver", "gold", "platinum", "diamond"]).default("starter").notNull(),
  /** Total personal sales volume */
  personalSales: int("personalSales").default(0).notNull(),
  /** Total team sales volume */
  teamSales: int("teamSales").default(0).notNull(),
  /** Total earnings */
  totalEarnings: int("totalEarnings").default(0).notNull(),
  /** Available balance for withdrawal */
  availableBalance: int("availableBalance").default(0).notNull(),
  /** Account status */
  status: mysqlEnum("status", ["active", "inactive", "suspended"]).default("active").notNull(),
  /** Enrollment timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Distributor = typeof distributors.$inferSelect;
export type InsertDistributor = typeof distributors.$inferInsert;

/**
 * Sales table for tracking all transactions.
 * Records both retail and distributor purchases.
 */
export const sales = mysqlTable("sales", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor ID who made the sale */
  distributorId: int("distributorId"),
  /** Customer user ID (if registered) */
  customerId: int("customerId"),
  /** Customer email */
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  /** Order total in cents */
  orderTotal: int("orderTotal").notNull(),
  /** Commission volume (BV - Business Volume) */
  commissionVolume: int("commissionVolume").notNull(),
  /** Sale type */
  saleType: mysqlEnum("saleType", ["retail", "distributor", "autoship"]).default("retail").notNull(),
  /** Payment status */
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "refunded"]).default("pending").notNull(),
  /** Order details (JSON) */
  orderDetails: text("orderDetails"),
  /** Sale timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Sale = typeof sales.$inferSelect;
export type InsertSale = typeof sales.$inferInsert;

/**
 * Commissions table for tracking earned commissions.
 * Records all commission payouts across the genealogy tree.
 */
export const commissions = mysqlTable("commissions", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor ID earning the commission */
  distributorId: int("distributorId").notNull(),
  /** Sale ID that generated this commission */
  saleId: int("saleId").notNull(),
  /** Source distributor ID (who made the sale) */
  sourceDistributorId: int("sourceDistributorId"),
  /** Commission type */
  commissionType: mysqlEnum("commissionType", ["direct", "team", "rank_bonus", "leadership"]).notNull(),
  /** Commission level (1 = direct, 2+ = downline levels) */
  level: int("level").notNull(),
  /** Commission amount in cents */
  amount: int("amount").notNull(),
  /** Commission percentage applied */
  percentage: int("percentage").notNull(),
  /** Payout status */
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  /** Commission earned timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

/**
 * Newsletter subscriptions with viral referral tracking.
 * Tracks email signups and friend referrals for discount tiers.
 */
export const newsletterSubscriptions = mysqlTable("newsletter_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  /** Subscriber email */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** Subscriber name */
  name: varchar("name", { length: 255 }),
  /** Referrer subscription ID (who referred this person) */
  referrerId: int("referrerId"),
  /** Discount tier earned (0 = base, 1 = email signup, 2 = 3 friends) */
  discountTier: int("discountTier").default(1).notNull(),
  /** Total referrals made */
  referralCount: int("referralCount").default(0).notNull(),
  /** Subscription status */
  status: mysqlEnum("status", ["active", "unsubscribed"]).default("active").notNull(),
  /** Subscription timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NewsletterSubscription = typeof newsletterSubscriptions.$inferSelect;
export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;

/**
 * Affiliate links table for tracking custom distributor URLs.
 * Stores generated affiliate links and click/conversion tracking.
 */
export const affiliateLinks = mysqlTable("affiliate_links", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor ID who owns this link */
  distributorId: int("distributorId").notNull(),
  /** Unique link code */
  linkCode: varchar("linkCode", { length: 50 }).notNull().unique(),
  /** Campaign name/description */
  campaignName: varchar("campaignName", { length: 255 }),
  /** Target URL path */
  targetPath: varchar("targetPath", { length: 500 }).default("/").notNull(),
  /** Total clicks */
  clicks: int("clicks").default(0).notNull(),
  /** Total conversions */
  conversions: int("conversions").default(0).notNull(),
  /** Link status */
  status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AffiliateLink = typeof affiliateLinks.$inferSelect;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;

/**
 * Product packages table - defines available purchase packages
 */
export const packages = mysqlTable("packages", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: mysqlEnum("type", ["distributor", "customer"]).notNull(),
  tier: mysqlEnum("tier", ["starter", "pro", "elite", "single", "12pack", "24pack"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  pv: int("pv").notNull(), // Personal Volume for commission calculation
  description: text("description"),
  contents: text("contents"), // JSON string of what's included
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Package = typeof packages.$inferSelect;
export type InsertPackage = typeof packages.$inferInsert;

/**
 * Orders table - tracks all product purchases
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  distributorId: int("distributorId"), // Referring distributor for commission tracking
  packageId: int("packageId").notNull(),
  orderNumber: varchar("orderNumber", { length: 50 }).notNull().unique(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  shippingAddress: text("shippingAddress").notNull(),
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  pv: int("pv").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "shipped", "delivered", "cancelled"]).default("pending").notNull(),
  stripePaymentId: varchar("stripePaymentId", { length: 255 }),
  isAutoShip: int("isAutoShip").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Auto-ship subscriptions table
 */
export const autoShipSubscriptions = mysqlTable("autoShipSubscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  packageId: int("packageId").notNull(),
  status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
  frequency: mysqlEnum("frequency", ["weekly", "biweekly", "monthly"]).default("monthly").notNull(),
  nextShipDate: timestamp("nextShipDate").notNull(),
  lastShipDate: timestamp("lastShipDate"),
  shippingAddress: text("shippingAddress").notNull(),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AutoShipSubscription = typeof autoShipSubscriptions.$inferSelect;
export type InsertAutoShipSubscription = typeof autoShipSubscriptions.$inferInsert;
