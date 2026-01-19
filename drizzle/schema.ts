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
