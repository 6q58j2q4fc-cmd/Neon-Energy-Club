import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

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
  /** Phone number for contact and shipping */
  phone: varchar("phone", { length: 50 }),
  /** Shipping address line 1 */
  addressLine1: text("addressLine1"),
  /** Shipping address line 2 (apt, suite, etc.) */
  addressLine2: text("addressLine2"),
  /** City for shipping */
  city: varchar("city", { length: 100 }),
  /** State/Province for shipping */
  state: varchar("state", { length: 100 }),
  /** Postal/ZIP code for shipping */
  postalCode: varchar("postalCode", { length: 20 }),
  /** Country for shipping */
  country: varchar("country", { length: 100 }),
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
  /** Shipping tracking number */
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  /** Shipping carrier (UPS, FedEx, USPS, DHL) */
  carrier: varchar("carrier", { length: 50 }),
  /** Estimated delivery date */
  estimatedDelivery: timestamp("estimatedDelivery"),
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
  /** Placement position in binary tree (left or right) */
  placementPosition: mysqlEnum("placementPosition", ["left", "right"]),
  /** Unique distributor code for affiliate links */
  distributorCode: varchar("distributorCode", { length: 50 }).notNull().unique(),
  /** Custom username for login */
  username: varchar("username", { length: 50 }).unique(),
  /** Unique subdomain for affiliate site (e.g., john.neonenergy.com) */
  subdomain: varchar("subdomain", { length: 50 }).unique(),
  /** Current rank/level */
  rank: mysqlEnum("rank", ["starter", "bronze", "silver", "gold", "platinum", "diamond", "crown", "ambassador"]).default("starter").notNull(),
  /** Total personal sales volume (PV) */
  personalSales: int("personalSales").default(0).notNull(),
  /** Total team sales volume (GV) */
  teamSales: int("teamSales").default(0).notNull(),
  /** Left leg volume for binary tree */
  leftLegVolume: int("leftLegVolume").default(0).notNull(),
  /** Right leg volume for binary tree */
  rightLegVolume: int("rightLegVolume").default(0).notNull(),
  /** Total earnings */
  totalEarnings: int("totalEarnings").default(0).notNull(),
  /** Available balance for withdrawal */
  availableBalance: int("availableBalance").default(0).notNull(),
  /** Monthly personal volume (resets monthly) */
  monthlyPV: int("monthlyPV").default(0).notNull(),
  /** Monthly autoship volume */
  monthlyAutoshipPV: int("monthlyAutoshipPV").default(0).notNull(),
  /** Number of personally enrolled active distributors */
  activeDownlineCount: int("activeDownlineCount").default(0).notNull(),
  /** Is this distributor currently active (met monthly requirements) */
  isActive: int("isActive").default(0).notNull(),
  /** Last activity qualification date */
  lastQualificationDate: timestamp("lastQualificationDate"),
  /** Fast start bonus eligible until */
  fastStartEligibleUntil: timestamp("fastStartEligibleUntil"),
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

/**
 * Blog posts table for automated content generation.
 * Stores AI-generated blog posts about NEON energy drink.
 */
export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  /** URL-friendly slug */
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  /** Post title */
  title: varchar("title", { length: 500 }).notNull(),
  /** Short excerpt/summary */
  excerpt: text("excerpt"),
  /** Full post content in markdown */
  content: text("content").notNull(),
  /** Featured image URL */
  featuredImage: varchar("featuredImage", { length: 500 }),
  /** Post category */
  category: mysqlEnum("category", [
    "product",
    "health",
    "business",
    "franchise",
    "distributor",
    "news",
    "lifestyle"
  ]).default("product").notNull(),
  /** SEO meta title */
  metaTitle: varchar("metaTitle", { length: 255 }),
  /** SEO meta description */
  metaDescription: text("metaDescription"),
  /** SEO keywords */
  keywords: text("keywords"),
  /** Post status */
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  /** Author name */
  author: varchar("author", { length: 255 }).default("NEON Team"),
  /** View count */
  views: int("views").default(0),
  /** Published date */
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;


/**
 * Claimed territories table for tracking which territories are already licensed.
 * Used to show availability on the territory map selector.
 */
export const claimedTerritories = mysqlTable("claimed_territories", {
  id: int("id").autoincrement().primaryKey(),
  /** Territory license ID (foreign key) */
  territoryLicenseId: int("territoryLicenseId").notNull(),
  /** Center latitude */
  centerLat: decimal("centerLat", { precision: 10, scale: 7 }).notNull(),
  /** Center longitude */
  centerLng: decimal("centerLng", { precision: 10, scale: 7 }).notNull(),
  /** Radius in miles */
  radiusMiles: int("radiusMiles").notNull(),
  /** Territory name/description */
  territoryName: varchar("territoryName", { length: 255 }).notNull(),
  /** Zip code (if applicable) */
  zipCode: varchar("zipCode", { length: 20 }),
  /** City */
  city: varchar("city", { length: 100 }),
  /** State */
  state: varchar("state", { length: 50 }),
  /** Status */
  status: mysqlEnum("status", ["pending", "active", "expired"]).default("pending").notNull(),
  /** Claim timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Expiration timestamp */
  expiresAt: timestamp("expiresAt"),
  /** Renewal date */
  renewalDate: timestamp("renewalDate"),
  /** License expiration date */
  expirationDate: timestamp("expirationDate"),
});

export type ClaimedTerritory = typeof claimedTerritories.$inferSelect;
export type InsertClaimedTerritory = typeof claimedTerritories.$inferInsert;

/**
 * Territory applications table for multi-step application workflow.
 * Stores application progress and all applicant details.
 */
export const territoryApplications = mysqlTable("territory_applications", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (if logged in) */
  userId: int("userId"),
  /** Application step (1-4) */
  currentStep: int("currentStep").default(1).notNull(),
  
  // Step 1: Territory Selection
  /** Center latitude */
  centerLat: decimal("centerLat", { precision: 10, scale: 7 }),
  /** Center longitude */
  centerLng: decimal("centerLng", { precision: 10, scale: 7 }),
  /** Radius in miles */
  radiusMiles: int("radiusMiles"),
  /** Territory name/description */
  territoryName: varchar("territoryName", { length: 255 }),
  /** Estimated population */
  estimatedPopulation: int("estimatedPopulation"),
  /** License term in months */
  termMonths: int("termMonths"),
  /** Total cost */
  totalCost: int("totalCost"),
  
  // Step 2: Personal Details
  /** Applicant first name */
  firstName: varchar("firstName", { length: 100 }),
  /** Applicant last name */
  lastName: varchar("lastName", { length: 100 }),
  /** Email address */
  email: varchar("email", { length: 320 }),
  /** Phone number */
  phone: varchar("phone", { length: 50 }),
  /** Date of birth */
  dateOfBirth: varchar("dateOfBirth", { length: 20 }),
  /** Street address */
  streetAddress: varchar("streetAddress", { length: 255 }),
  /** City */
  city: varchar("city", { length: 100 }),
  /** State */
  state: varchar("state", { length: 50 }),
  /** Zip code */
  zipCode: varchar("zipCode", { length: 20 }),
  
  // Step 3: Business Information
  /** Business name (if applicable) */
  businessName: varchar("businessName", { length: 255 }),
  /** Business type */
  businessType: mysqlEnum("businessType", ["individual", "llc", "corporation", "partnership"]),
  /** Tax ID / EIN */
  taxId: varchar("taxId", { length: 50 }),
  /** Years in business */
  yearsInBusiness: int("yearsInBusiness"),
  /** Investment capital available */
  investmentCapital: int("investmentCapital"),
  /** Previous franchise experience */
  franchiseExperience: text("franchiseExperience"),
  /** Why interested in NEON */
  whyInterested: text("whyInterested"),
  
  // Step 4: Review & Submit
  /** Agreed to terms */
  agreedToTerms: int("agreedToTerms").default(0).notNull(),
  /** Signature (typed name) */
  signature: varchar("signature", { length: 255 }),
  /** Submitted timestamp */
  submittedAt: timestamp("submittedAt"),
  
  /** Application status */
  status: mysqlEnum("status", ["draft", "submitted", "under_review", "approved", "rejected"]).default("draft").notNull(),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TerritoryApplication = typeof territoryApplications.$inferSelect;
export type InsertTerritoryApplication = typeof territoryApplications.$inferInsert;


/**
 * NEON Relaunch NFTs table.
 * Each order gets a unique limited edition NFT with rarity based on order number.
 * Lower order numbers = more rare and valuable.
 */
export const neonNfts = mysqlTable("neon_nfts", {
  id: int("id").autoincrement().primaryKey(),
  /** Order ID this NFT is tied to */
  orderId: int("orderId"),
  /** Pre-order ID (for pre-orders) */
  preorderId: int("preorderId"),
  /** Crowdfunding contribution ID */
  crowdfundingId: int("crowdfundingId"),
  /** User ID who owns this NFT */
  userId: int("userId"),
  /** Unique NFT token ID (sequential, determines rarity) */
  tokenId: int("tokenId").notNull().unique(),
  /** NFT name (e.g., "NEON Genesis #1") */
  name: varchar("name", { length: 255 }).notNull(),
  /** NFT description */
  description: text("description"),
  /** Generated NFT image URL */
  imageUrl: varchar("imageUrl", { length: 500 }),
  /** Rarity tier based on token ID */
  rarity: mysqlEnum("rarity", ["legendary", "epic", "rare", "uncommon", "common"]).notNull(),
  /** Rarity rank (1 = most rare) */
  rarityRank: int("rarityRank").notNull(),
  /** Estimated value in USD */
  estimatedValue: decimal("estimatedValue", { precision: 10, scale: 2 }),
  /** Owner email */
  ownerEmail: varchar("ownerEmail", { length: 320 }),
  /** Owner name */
  ownerName: varchar("ownerName", { length: 255 }),
  /** Package/tier that earned this NFT */
  packageType: varchar("packageType", { length: 100 }),
  /** Blockchain transaction hash (for future minting) */
  txHash: varchar("txHash", { length: 100 }),
  /** Blockchain status */
  blockchainStatus: mysqlEnum("blockchainStatus", ["pending", "minted", "transferred"]).default("pending").notNull(),
  /** Mint timestamp */
  mintedAt: timestamp("mintedAt"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type NeonNft = typeof neonNfts.$inferSelect;
export type InsertNeonNft = typeof neonNfts.$inferInsert;


/**
 * SMS Opt-in table for tracking user SMS preferences and referral codes.
 * Links subscribers to their unique referral codes for tracking conversions.
 */
export const smsOptIns = mysqlTable("sms_opt_ins", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (if registered) */
  userId: int("userId"),
  /** Phone number */
  phone: varchar("phone", { length: 50 }).notNull(),
  /** Email address */
  email: varchar("email", { length: 320 }),
  /** Subscriber's name */
  name: varchar("name", { length: 255 }),
  /** Unique subscriber ID for tracking */
  subscriberId: varchar("subscriberId", { length: 50 }).notNull().unique(),
  /** Unique referral code for this subscriber */
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
  /** Referred by subscriber ID */
  referredBy: varchar("referredBy", { length: 50 }),
  /** SMS opt-in status */
  optedIn: int("optedIn").default(1).notNull(),
  /** Opt-in timestamp */
  optInDate: timestamp("optInDate").defaultNow(),
  /** Opt-out timestamp */
  optOutDate: timestamp("optOutDate"),
  /** Preferences - order updates */
  prefOrderUpdates: int("prefOrderUpdates").default(1).notNull(),
  /** Preferences - promotions */
  prefPromotions: int("prefPromotions").default(1).notNull(),
  /** Preferences - referral alerts */
  prefReferralAlerts: int("prefReferralAlerts").default(1).notNull(),
  /** Preferences - territory updates */
  prefTerritoryUpdates: int("prefTerritoryUpdates").default(1).notNull(),
  /** Total referrals made */
  totalReferrals: int("totalReferrals").default(0).notNull(),
  /** Referrals converted to customers */
  customersReferred: int("customersReferred").default(0).notNull(),
  /** Referrals converted to distributors */
  distributorsReferred: int("distributorsReferred").default(0).notNull(),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SMSOptIn = typeof smsOptIns.$inferSelect;
export type InsertSMSOptIn = typeof smsOptIns.$inferInsert;

/**
 * Referral tracking table for detailed referral analytics.
 * Tracks each referral from source to conversion.
 */
export const referralTracking = mysqlTable("referral_tracking", {
  id: int("id").autoincrement().primaryKey(),
  /** Referrer's subscriber ID */
  referrerId: varchar("referrerId", { length: 50 }).notNull(),
  /** Referrer's name */
  referrerName: varchar("referrerName", { length: 255 }),
  /** Referral code used */
  referralCode: varchar("referralCode", { length: 50 }).notNull(),
  /** Referred person's phone (if SMS) */
  referredPhone: varchar("referredPhone", { length: 50 }),
  /** Referred person's email */
  referredEmail: varchar("referredEmail", { length: 320 }),
  /** Referred person's name */
  referredName: varchar("referredName", { length: 255 }),
  /** Source of referral */
  source: mysqlEnum("source", ["sms", "email", "social", "direct", "whatsapp", "twitter", "facebook"]).default("direct").notNull(),
  /** Referral status */
  status: mysqlEnum("status", ["pending", "clicked", "signed_up", "customer", "distributor"]).default("pending").notNull(),
  /** Converted to customer */
  convertedToCustomer: int("convertedToCustomer").default(0).notNull(),
  /** Converted to distributor */
  convertedToDistributor: int("convertedToDistributor").default(0).notNull(),
  /** Customer order ID (if converted) */
  customerOrderId: int("customerOrderId"),
  /** Distributor ID (if converted) */
  distributorId: int("distributorId"),
  /** Referral bonus paid */
  bonusPaid: int("bonusPaid").default(0).notNull(),
  /** Bonus amount in cents */
  bonusAmount: int("bonusAmount").default(0).notNull(),
  /** Click timestamp */
  clickedAt: timestamp("clickedAt"),
  /** Signup timestamp */
  signedUpAt: timestamp("signedUpAt"),
  /** Conversion timestamp */
  convertedAt: timestamp("convertedAt"),
  /** Creation timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReferralTracking = typeof referralTracking.$inferSelect;
export type InsertReferralTracking = typeof referralTracking.$inferInsert;

/**
 * SMS message log for tracking all sent messages.
 * Used for analytics and compliance.
 */
export const smsMessageLog = mysqlTable("sms_message_log", {
  id: int("id").autoincrement().primaryKey(),
  /** Recipient phone number */
  phone: varchar("phone", { length: 50 }).notNull(),
  /** Recipient name */
  recipientName: varchar("recipientName", { length: 255 }),
  /** Message type */
  messageType: mysqlEnum("messageType", [
    "order_confirmation",
    "shipping_update",
    "delivery_confirmation",
    "territory_submitted",
    "territory_approved",
    "territory_rejected",
    "referral_invite",
    "welcome",
    "nft_minted",
    "crowdfund_contribution",
    "promotional"
  ]).notNull(),
  /** Message content */
  messageContent: text("messageContent").notNull(),
  /** Message ID from SMS provider */
  messageId: varchar("messageId", { length: 100 }),
  /** Delivery status */
  status: mysqlEnum("status", ["pending", "sent", "delivered", "failed"]).default("pending").notNull(),
  /** Error message if failed */
  errorMessage: text("errorMessage"),
  /** Sent timestamp */
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  /** Delivered timestamp */
  deliveredAt: timestamp("deliveredAt"),
});

export type SMSMessageLog = typeof smsMessageLog.$inferSelect;
export type InsertSMSMessageLog = typeof smsMessageLog.$inferInsert;


/**
 * Investor inquiries table.
 * Stores potential investor contact information and investment preferences.
 */
export const investorInquiries = mysqlTable("investor_inquiries", {
  id: int("id").autoincrement().primaryKey(),
  /** Investor full name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Investor email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Investor phone number */
  phone: varchar("phone", { length: 50 }),
  /** Company name (if applicable) */
  company: varchar("company", { length: 255 }),
  /** Investment range interest */
  investmentRange: mysqlEnum("investmentRange", [
    "under_10k",
    "10k_50k",
    "50k_100k",
    "100k_500k",
    "500k_1m",
    "over_1m"
  ]).notNull(),
  /** Accredited investor status */
  accreditedStatus: mysqlEnum("accreditedStatus", ["yes", "no", "unsure"]).notNull(),
  /** Type of investment interest */
  investmentType: mysqlEnum("investmentType", [
    "equity",
    "convertible_note",
    "revenue_share",
    "franchise",
    "other"
  ]).notNull(),
  /** How they heard about NEON */
  referralSource: varchar("referralSource", { length: 255 }),
  /** Additional message/questions */
  message: text("message"),
  /** Inquiry status */
  status: mysqlEnum("status", ["new", "contacted", "in_discussion", "committed", "declined"]).default("new").notNull(),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  /** Inquiry timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Last update timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InvestorInquiry = typeof investorInquiries.$inferSelect;
export type InsertInvestorInquiry = typeof investorInquiries.$inferInsert;


/**
 * Distributor Autoship table for recurring monthly orders.
 * Allows distributors to maintain their PV requirements automatically.
 */
export const distributorAutoships = mysqlTable("distributor_autoships", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor ID */
  distributorId: int("distributorId").notNull(),
  /** User ID for shipping info */
  userId: int("userId").notNull(),
  /** Autoship name/description */
  name: varchar("name", { length: 255 }).default("Monthly Autoship"),
  /** Status of the autoship */
  status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
  /** Day of month to process (1-28) */
  processDay: int("processDay").default(1).notNull(),
  /** Total PV for this autoship */
  totalPV: int("totalPV").default(0).notNull(),
  /** Total price in cents */
  totalPrice: int("totalPrice").default(0).notNull(),
  /** Payment method ID (Stripe) */
  paymentMethodId: varchar("paymentMethodId", { length: 255 }),
  /** Stripe customer ID */
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  /** Shipping address line 1 */
  shippingAddress1: text("shippingAddress1"),
  /** Shipping address line 2 */
  shippingAddress2: text("shippingAddress2"),
  /** Shipping city */
  shippingCity: varchar("shippingCity", { length: 100 }),
  /** Shipping state */
  shippingState: varchar("shippingState", { length: 100 }),
  /** Shipping postal code */
  shippingPostalCode: varchar("shippingPostalCode", { length: 20 }),
  /** Shipping country */
  shippingCountry: varchar("shippingCountry", { length: 100 }).default("USA"),
  /** Next processing date */
  nextProcessDate: timestamp("nextProcessDate"),
  /** Last processed date */
  lastProcessedDate: timestamp("lastProcessedDate"),
  /** Number of successful orders */
  successfulOrders: int("successfulOrders").default(0),
  /** Number of failed attempts */
  failedAttempts: int("failedAttempts").default(0),
  /** Last failure reason */
  lastFailureReason: text("lastFailureReason"),
  /** Email reminder sent for upcoming autoship */
  reminderSent: int("reminderSent").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DistributorAutoship = typeof distributorAutoships.$inferSelect;
export type InsertDistributorAutoship = typeof distributorAutoships.$inferInsert;

/**
 * Autoship items table for products in each autoship.
 */
export const autoshipItems = mysqlTable("autoship_items", {
  id: int("id").autoincrement().primaryKey(),
  /** Autoship ID */
  autoshipId: int("autoshipId").notNull(),
  /** Product SKU */
  productSku: varchar("productSku", { length: 100 }).notNull(),
  /** Product name */
  productName: varchar("productName", { length: 255 }).notNull(),
  /** Quantity */
  quantity: int("quantity").default(1).notNull(),
  /** PV per unit */
  pvPerUnit: int("pvPerUnit").default(0).notNull(),
  /** Price per unit in cents */
  pricePerUnit: int("pricePerUnit").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutoshipItem = typeof autoshipItems.$inferSelect;
export type InsertAutoshipItem = typeof autoshipItems.$inferInsert;

/**
 * Autoship order history table.
 */
export const autoshipOrders = mysqlTable("autoship_orders", {
  id: int("id").autoincrement().primaryKey(),
  /** Autoship ID */
  autoshipId: int("autoshipId").notNull(),
  /** Distributor ID */
  distributorId: int("distributorId").notNull(),
  /** Order status */
  status: mysqlEnum("status", ["pending", "processing", "completed", "failed", "refunded"]).default("pending").notNull(),
  /** Total PV credited */
  totalPV: int("totalPV").default(0).notNull(),
  /** Total amount in cents */
  totalAmount: int("totalAmount").default(0).notNull(),
  /** Stripe payment intent ID */
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  /** Tracking number */
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  /** Carrier */
  carrier: varchar("carrier", { length: 50 }),
  /** Failure reason if failed */
  failureReason: text("failureReason"),
  /** Processing date */
  processedAt: timestamp("processedAt"),
  /** Shipped date */
  shippedAt: timestamp("shippedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AutoshipOrder = typeof autoshipOrders.$inferSelect;
export type InsertAutoshipOrder = typeof autoshipOrders.$inferInsert;

/**
 * Payout settings table for distributor payout preferences.
 */
export const payoutSettings = mysqlTable("payout_settings", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor ID */
  distributorId: int("distributorId").notNull().unique(),
  /** Preferred payout method */
  payoutMethod: mysqlEnum("payoutMethod", ["stripe_connect", "paypal", "bank_transfer", "check"]).default("stripe_connect").notNull(),
  /** Stripe Connect account ID */
  stripeConnectAccountId: varchar("stripeConnectAccountId", { length: 255 }),
  /** Stripe Connect onboarding status */
  stripeConnectStatus: mysqlEnum("stripeConnectStatus", ["pending", "onboarding", "active", "restricted", "disabled"]).default("pending"),
  /** PayPal email */
  paypalEmail: varchar("paypalEmail", { length: 320 }),
  /** Bank account holder name */
  bankAccountName: varchar("bankAccountName", { length: 255 }),
  /** Bank routing number (encrypted) */
  bankRoutingNumber: varchar("bankRoutingNumber", { length: 255 }),
  /** Bank account number (last 4 only) */
  bankAccountLast4: varchar("bankAccountLast4", { length: 4 }),
  /** Bank account type */
  bankAccountType: mysqlEnum("bankAccountType", ["checking", "savings"]).default("checking"),
  /** Mailing address for checks */
  checkMailingAddress: text("checkMailingAddress"),
  /** Minimum payout threshold in cents (default $50) */
  minimumPayout: int("minimumPayout").default(5000).notNull(),
  /** Payout frequency */
  payoutFrequency: mysqlEnum("payoutFrequency", ["weekly", "biweekly", "monthly"]).default("weekly").notNull(),
  /** Tax form submitted (W-9 for US) */
  taxFormSubmitted: int("taxFormSubmitted").default(0),
  /** Tax ID (SSN last 4 or EIN) */
  taxIdLast4: varchar("taxIdLast4", { length: 4 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayoutSetting = typeof payoutSettings.$inferSelect;
export type InsertPayoutSetting = typeof payoutSettings.$inferInsert;

/**
 * Payout requests table for tracking commission payouts.
 */
export const payoutRequests = mysqlTable("payout_requests", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor ID */
  distributorId: int("distributorId").notNull(),
  /** Request amount in cents */
  amount: int("amount").notNull(),
  /** Processing fee in cents */
  processingFee: int("processingFee").default(0),
  /** Net amount after fees */
  netAmount: int("netAmount").notNull(),
  /** Payout method used */
  payoutMethod: mysqlEnum("payoutMethod", ["stripe_connect", "paypal", "bank_transfer", "check"]).notNull(),
  /** Request status */
  status: mysqlEnum("status", ["pending", "approved", "processing", "completed", "failed", "cancelled"]).default("pending").notNull(),
  /** Stripe transfer ID */
  stripeTransferId: varchar("stripeTransferId", { length: 255 }),
  /** PayPal payout batch ID */
  paypalPayoutId: varchar("paypalPayoutId", { length: 255 }),
  /** Check number if paid by check */
  checkNumber: varchar("checkNumber", { length: 50 }),
  /** Admin who approved */
  approvedBy: int("approvedBy"),
  /** Approval date */
  approvedAt: timestamp("approvedAt"),
  /** Processing date */
  processedAt: timestamp("processedAt"),
  /** Completion date */
  completedAt: timestamp("completedAt"),
  /** Failure reason */
  failureReason: text("failureReason"),
  /** Notes */
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PayoutRequest = typeof payoutRequests.$inferSelect;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;

/**
 * Payout history table for completed payouts.
 */
export const payoutHistory = mysqlTable("payout_history", {
  id: int("id").autoincrement().primaryKey(),
  /** Payout request ID */
  payoutRequestId: int("payoutRequestId").notNull(),
  /** Distributor ID */
  distributorId: int("distributorId").notNull(),
  /** Amount paid in cents */
  amount: int("amount").notNull(),
  /** Payout method */
  payoutMethod: varchar("payoutMethod", { length: 50 }).notNull(),
  /** Transaction reference */
  transactionRef: varchar("transactionRef", { length: 255 }),
  /** Period start date */
  periodStart: timestamp("periodStart"),
  /** Period end date */
  periodEnd: timestamp("periodEnd"),
  /** Commissions included (JSON array of commission IDs) */
  commissionsIncluded: text("commissionsIncluded"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PayoutHistoryRecord = typeof payoutHistory.$inferSelect;
export type InsertPayoutHistoryRecord = typeof payoutHistory.$inferInsert;


/**
 * Rank history table for tracking distributor rank progressions.
 * Records each rank change with timestamps for milestone tracking.
 */
export const rankHistory = mysqlTable("rank_history", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to distributor */
  distributorId: int("distributorId").notNull(),
  /** Previous rank before change */
  previousRank: varchar("previousRank", { length: 50 }).notNull(),
  /** New rank after change */
  newRank: varchar("newRank", { length: 50 }).notNull(),
  /** Personal PV at time of rank change */
  personalPVAtChange: int("personalPVAtChange").default(0),
  /** Team PV at time of rank change */
  teamPVAtChange: int("teamPVAtChange").default(0),
  /** Whether notification was sent */
  notificationSent: boolean("notificationSent").default(false),
  /** When the rank change occurred */
  achievedAt: timestamp("achievedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RankHistoryRecord = typeof rankHistory.$inferSelect;
export type InsertRankHistoryRecord = typeof rankHistory.$inferInsert;

/**
 * In-app notifications table for user alerts.
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  /** Reference to user */
  userId: int("userId").notNull(),
  /** Notification type (rank_advancement, commission_paid, etc.) */
  type: varchar("type", { length: 50 }).notNull(),
  /** Notification title */
  title: varchar("title", { length: 255 }).notNull(),
  /** Notification message */
  message: text("message").notNull(),
  /** Additional data as JSON */
  data: text("data"),
  /** Whether notification has been read */
  isRead: boolean("isRead").default(false),
  /** When notification was read */
  readAt: timestamp("readAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;


/**
 * Customer referral tracking for 3-for-Free program.
 * Customers earn a free case when 3 referred friends make purchases.
 */
export const customerReferrals = mysqlTable("customer_referrals", {
  id: int("id").autoincrement().primaryKey(),
  /** The customer who made the referral */
  referrerId: int("referrerId").notNull(),
  /** The referred customer (who made a purchase) */
  referredId: int("referredId").notNull(),
  /** Referral code used */
  referralCode: varchar("referralCode", { length: 50 }).notNull(),
  /** Whether the referred customer made a qualifying purchase */
  purchaseCompleted: boolean("purchaseCompleted").default(false),
  /** Order ID of the qualifying purchase */
  orderId: int("orderId"),
  /** Purchase amount */
  purchaseAmount: decimal("purchaseAmount", { precision: 10, scale: 2 }),
  /** When the referral was created */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** When the purchase was completed */
  purchaseCompletedAt: timestamp("purchaseCompletedAt"),
});
export type CustomerReferral = typeof customerReferrals.$inferSelect;
export type InsertCustomerReferral = typeof customerReferrals.$inferInsert;

/**
 * Customer rewards for the 3-for-Free program.
 * Tracks earned free cases and redemption status.
 */
export const customerRewards = mysqlTable("customer_rewards", {
  id: int("id").autoincrement().primaryKey(),
  /** Customer who earned the reward */
  userId: int("userId").notNull(),
  /** Type of reward (free_case, discount, etc.) */
  rewardType: varchar("rewardType", { length: 50 }).notNull(),
  /** Description of the reward */
  description: varchar("description", { length: 255 }).notNull(),
  /** Value of the reward (e.g., $42 for a free case) */
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  /** Number of referrals that triggered this reward */
  referralCount: int("referralCount").default(3),
  /** Status: pending, available, redeemed, expired */
  status: mysqlEnum("status", ["pending", "available", "redeemed", "expired"]).default("available").notNull(),
  /** Redemption code for the reward */
  redemptionCode: varchar("redemptionCode", { length: 50 }),
  /** When the reward was redeemed */
  redeemedAt: timestamp("redeemedAt"),
  /** Order ID if redeemed on an order */
  redeemedOrderId: int("redeemedOrderId"),
  /** Expiration date for the reward */
  expiresAt: timestamp("expiresAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CustomerReward = typeof customerRewards.$inferSelect;
export type InsertCustomerReward = typeof customerRewards.$inferInsert;

/**
 * Distributor NEON Reward Points for 3-for-Free autoship program.
 * Distributors who sell 3 autoships per month earn points toward a free case.
 */
export const distributorRewardPoints = mysqlTable("distributor_reward_points", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor who earned the points */
  distributorId: int("distributorId").notNull(),
  /** Points earned (1 point per qualifying autoship sale) */
  points: int("points").default(0).notNull(),
  /** Source of points (autoship_sale, bonus, etc.) */
  source: varchar("source", { length: 50 }).notNull(),
  /** Description of how points were earned */
  description: varchar("description", { length: 255 }),
  /** Related order or autoship ID */
  relatedId: int("relatedId"),
  /** Month/year for tracking (YYYY-MM format) */
  periodMonth: varchar("periodMonth", { length: 7 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DistributorRewardPoint = typeof distributorRewardPoints.$inferSelect;
export type InsertDistributorRewardPoint = typeof distributorRewardPoints.$inferInsert;

/**
 * Distributor free case rewards earned through the 3-for-Free program.
 */
export const distributorFreeRewards = mysqlTable("distributor_free_rewards", {
  id: int("id").autoincrement().primaryKey(),
  /** Distributor who earned the reward */
  distributorId: int("distributorId").notNull(),
  /** Points redeemed for this reward */
  pointsRedeemed: int("pointsRedeemed").default(3).notNull(),
  /** Month the reward was earned (YYYY-MM) */
  earnedMonth: varchar("earnedMonth", { length: 7 }).notNull(),
  /** Status: pending, shipped, delivered */
  status: mysqlEnum("status", ["pending", "shipped", "delivered"]).default("pending").notNull(),
  /** Shipping tracking number */
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  /** When the reward was shipped */
  shippedAt: timestamp("shippedAt"),
  /** When the reward was delivered */
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type DistributorFreeReward = typeof distributorFreeRewards.$inferSelect;
export type InsertDistributorFreeReward = typeof distributorFreeRewards.$inferInsert;

/**
 * Customer referral codes for tracking.
 */
export const customerReferralCodes = mysqlTable("customer_referral_codes", {
  id: int("id").autoincrement().primaryKey(),
  /** User who owns this referral code */
  userId: int("userId").notNull(),
  /** Unique referral code */
  code: varchar("code", { length: 50 }).notNull().unique(),
  /** Number of times this code has been used */
  usageCount: int("usageCount").default(0).notNull(),
  /** Total successful referrals (purchases completed) */
  successfulReferrals: int("successfulReferrals").default(0).notNull(),
  /** Whether the code is active */
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type CustomerReferralCode = typeof customerReferralCodes.$inferSelect;
export type InsertCustomerReferralCode = typeof customerReferralCodes.$inferInsert;


/**
 * Reward redemptions tracking table.
 * Tracks shipping info and fulfillment status for redeemed rewards.
 */
export const rewardRedemptions = mysqlTable("reward_redemptions", {
  id: int("id").autoincrement().primaryKey(),
  /** ID of the reward being redeemed */
  rewardId: int("rewardId").notNull(),
  /** Type of reward: customer or distributor */
  rewardType: mysqlEnum("rewardType", ["customer", "distributor"]).notNull(),
  /** Recipient name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Recipient email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Recipient phone */
  phone: varchar("phone", { length: 50 }),
  /** Shipping address line 1 */
  addressLine1: text("addressLine1").notNull(),
  /** Shipping address line 2 */
  addressLine2: text("addressLine2"),
  /** City */
  city: varchar("city", { length: 100 }).notNull(),
  /** State */
  state: varchar("state", { length: 100 }).notNull(),
  /** Postal code */
  postalCode: varchar("postalCode", { length: 20 }).notNull(),
  /** Country */
  country: varchar("country", { length: 100 }).notNull(),
  /** Fulfillment status */
  status: mysqlEnum("status", ["pending", "processing", "shipped", "delivered"]).default("pending").notNull(),
  /** Tracking number */
  trackingNumber: varchar("trackingNumber", { length: 100 }),
  /** When the order was shipped */
  shippedAt: timestamp("shippedAt"),
  /** When the order was delivered */
  deliveredAt: timestamp("deliveredAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type RewardRedemption = typeof rewardRedemptions.$inferSelect;
export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;

/**
 * Vending machine applications table.
 * Tracks applications from people interested in owning NEON vending machines.
 */
export const vendingApplications = mysqlTable("vending_applications", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  businessName: varchar("businessName", { length: 255 }),
  businessType: varchar("businessType", { length: 100 }).notNull(),
  yearsInBusiness: varchar("yearsInBusiness", { length: 50 }),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  zipCode: varchar("zipCode", { length: 20 }).notNull(),
  proposedLocations: text("proposedLocations"),
  numberOfMachines: varchar("numberOfMachines", { length: 50 }).notNull(),
  investmentBudget: varchar("investmentBudget", { length: 50 }),
  timeline: varchar("timeline", { length: 50 }),
  experience: text("experience"),
  questions: text("questions"),
  status: mysqlEnum("status", ["pending", "under_review", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type VendingApplication = typeof vendingApplications.$inferSelect;
export type InsertVendingApplication = typeof vendingApplications.$inferInsert;

/**
 * Franchise applications table.
 * Tracks applications from people interested in franchise territory ownership.
 */
export const franchiseApplications = mysqlTable("franchise_applications", {
  id: int("id").autoincrement().primaryKey(),
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  territoryCity: varchar("territoryCity", { length: 100 }).notNull(),
  territoryState: varchar("territoryState", { length: 100 }).notNull(),
  territorySize: varchar("territorySize", { length: 50 }).notNull(),
  exclusivityType: varchar("exclusivityType", { length: 50 }).notNull(),
  investmentCapital: varchar("investmentCapital", { length: 50 }).notNull(),
  financingNeeded: varchar("financingNeeded", { length: 50 }),
  netWorth: varchar("netWorth", { length: 50 }),
  businessExperience: varchar("businessExperience", { length: 100 }).notNull(),
  distributionExperience: text("distributionExperience"),
  teamSize: varchar("teamSize", { length: 50 }),
  motivation: text("motivation").notNull(),
  timeline: varchar("timeline", { length: 50 }).notNull(),
  questions: text("questions"),
  status: mysqlEnum("status", ["pending", "under_review", "approved", "rejected"]).default("pending").notNull(),
  adminNotes: text("adminNotes"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type FranchiseApplication = typeof franchiseApplications.$inferSelect;
export type InsertFranchiseApplication = typeof franchiseApplications.$inferInsert;

/**
 * Push notification subscriptions table.
 * Stores browser push notification subscriptions for distributors.
 */
export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  userAgent: text("userAgent"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type PushSubscription = typeof pushSubscriptions.$inferSelect;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;

/**
 * User profiles for personalized landing pages.
 * Stores custom referral slugs, profile photos, display names, and locations.
 * Used by both distributors and customers for their personalized website clones.
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (foreign key to users table) */
  userId: int("userId").notNull().unique(),
  /** Custom referral slug for personalized URL (e.g., neonenergyclub.com/john-smith) */
  customSlug: varchar("customSlug", { length: 100 }).unique(),
  /** Profile photo URL (stored in S3) */
  profilePhotoUrl: text("profilePhotoUrl"),
  /** Custom display name for landing page */
  displayName: varchar("displayName", { length: 255 }),
  /** Location (city, state) for landing page */
  location: varchar("location", { length: 255 }),
  /** Bio/tagline for landing page */
  bio: text("bio"),
  /** User type: distributor or customer */
  userType: mysqlEnum("userType", ["distributor", "customer"]).notNull(),
  /** Whether the personalized page is published */
  isPublished: boolean("isPublished").default(true).notNull(),
  /** Total visits to personalized page */
  pageViews: int("pageViews").default(0).notNull(),
  /** Total signups through personalized page */
  signupsGenerated: int("signupsGenerated").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;



/**
 * Scheduled meetings/calls table.
 * Stores consultation call bookings for franchise and vending opportunities.
 */
export const scheduledMeetings = mysqlTable("scheduled_meetings", {
  id: int("id").autoincrement().primaryKey(),
  /** User ID (if logged in) */
  userId: int("userId"),
  /** Applicant name */
  name: varchar("name", { length: 255 }).notNull(),
  /** Applicant email */
  email: varchar("email", { length: 320 }).notNull(),
  /** Applicant phone */
  phone: varchar("phone", { length: 50 }),
  /** Meeting type: franchise, vending, general */
  meetingType: mysqlEnum("meetingType", ["franchise", "vending", "general"]).notNull(),
  /** Scheduled date and time (UTC) */
  scheduledAt: timestamp("scheduledAt").notNull(),
  /** Duration in minutes */
  durationMinutes: int("durationMinutes").default(30).notNull(),
  /** Timezone of the user */
  timezone: varchar("timezone", { length: 100 }).default("America/New_York").notNull(),
  /** Meeting status */
  status: mysqlEnum("status", ["scheduled", "confirmed", "completed", "cancelled", "no_show"]).default("scheduled").notNull(),
  /** Additional notes from applicant */
  notes: text("notes"),
  /** Admin notes */
  adminNotes: text("adminNotes"),
  /** Meeting link (Zoom, Google Meet, etc.) */
  meetingLink: text("meetingLink"),
  /** Reminder sent flag */
  reminderSent: boolean("reminderSent").default(false).notNull(),
  /** Created timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  /** Updated timestamp */
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type ScheduledMeeting = typeof scheduledMeetings.$inferSelect;
export type InsertScheduledMeeting = typeof scheduledMeetings.$inferInsert;

/**
 * Available time slots for scheduling.
 * Admin-managed slots for when calls can be booked.
 */
export const availableTimeSlots = mysqlTable("available_time_slots", {
  id: int("id").autoincrement().primaryKey(),
  /** Day of week (0=Sunday, 6=Saturday) */
  dayOfWeek: int("dayOfWeek").notNull(),
  /** Start time (HH:MM format in 24h) */
  startTime: varchar("startTime", { length: 5 }).notNull(),
  /** End time (HH:MM format in 24h) */
  endTime: varchar("endTime", { length: 5 }).notNull(),
  /** Is this slot active */
  isActive: boolean("isActive").default(true).notNull(),
  /** Created timestamp */
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AvailableTimeSlot = typeof availableTimeSlots.$inferSelect;
export type InsertAvailableTimeSlot = typeof availableTimeSlots.$inferInsert;
