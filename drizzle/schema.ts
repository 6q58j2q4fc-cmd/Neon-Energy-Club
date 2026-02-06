import { mysqlTable, int, varchar, text, timestamp, mysqlEnum, decimal, index, tinyint, boolean, date } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const affiliateLinks = mysqlTable("affiliate_links", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	linkCode: varchar({ length: 50 }).notNull(),
	campaignName: varchar({ length: 255 }),
	targetPath: varchar({ length: 500 }).default('/').notNull(),
	clicks: int().default(0).notNull(),
	conversions: int().default(0).notNull(),
	status: mysqlEnum(['active','inactive']).default('active').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("affiliate_links_linkCode_unique").on(table.linkCode),
]);

export const autoShipSubscriptions = mysqlTable("autoShipSubscriptions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	packageId: int().notNull(),
	status: mysqlEnum(['active','paused','cancelled']).default('active').notNull(),
	frequency: mysqlEnum(['weekly','biweekly','monthly']).default('monthly').notNull(),
	nextShipDate: timestamp({ mode: 'string' }).notNull(),
	lastShipDate: timestamp({ mode: 'string' }),
	shippingAddress: text().notNull(),
	stripeSubscriptionId: varchar({ length: 255 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const autoshipItems = mysqlTable("autoship_items", {
	id: int().autoincrement().notNull(),
	autoshipId: int().notNull(),
	productSku: varchar({ length: 100 }).notNull(),
	productName: varchar({ length: 255 }).notNull(),
	quantity: int().default(1).notNull(),
	pvPerUnit: int().default(0).notNull(),
	pricePerUnit: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const autoshipOrders = mysqlTable("autoship_orders", {
	id: int().autoincrement().notNull(),
	autoshipId: int().notNull(),
	distributorId: int().notNull(),
	status: mysqlEnum(['pending','processing','completed','failed','refunded']).default('pending').notNull(),
	totalPv: int().default(0).notNull(),
	totalAmount: int().default(0).notNull(),
	stripePaymentIntentId: varchar({ length: 255 }),
	trackingNumber: varchar({ length: 100 }),
	carrier: varchar({ length: 50 }),
	failureReason: text(),
	processedAt: timestamp({ mode: 'string' }),
	shippedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const availableTimeSlots = mysqlTable("available_time_slots", {
	id: int().autoincrement().notNull(),
	dayOfWeek: int().notNull(),
	startTime: varchar({ length: 5 }).notNull(),
	endTime: varchar({ length: 5 }).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const backupSchedules = mysqlTable("backup_schedules", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	backupType: mysqlEnum(['full','incremental']).default('incremental').notNull(),
	tables: text(),
	cronExpression: varchar({ length: 100 }).notNull(),
	retentionDays: int().default(30).notNull(),
	isActive: tinyint().default(1).notNull(),
	lastRunAt: timestamp({ mode: 'string' }),
	nextRunAt: timestamp({ mode: 'string' }),
	lastRunStatus: mysqlEnum(['success','failed','never_run']).default('never_run'),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const backupSnapshots = mysqlTable("backup_snapshots", {
	id: int().autoincrement().notNull(),
	backupId: int().notNull(),
	tableName: varchar({ length: 100 }).notNull(),
	recordId: int().notNull(),
	recordData: text().notNull(),
	dataHash: varchar({ length: 64 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const blogPosts = mysqlTable("blog_posts", {
	id: int().autoincrement().notNull(),
	slug: varchar({ length: 255 }).notNull(),
	title: varchar({ length: 500 }).notNull(),
	excerpt: text(),
	content: text().notNull(),
	featuredImage: varchar({ length: 500 }),
	category: mysqlEnum(['product','health','business','franchise','distributor','news','lifestyle']).default('product').notNull(),
	metaTitle: varchar({ length: 255 }),
	metaDescription: text(),
	keywords: text(),
	status: mysqlEnum(['draft','published','archived']).default('draft').notNull(),
	author: varchar({ length: 255 }).default('NEON Team'),
	views: int().default(0),
	publishedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("blog_posts_slug_unique").on(table.slug),
]);

export const claimedTerritories = mysqlTable("claimed_territories", {
	id: int().autoincrement().notNull(),
	territoryLicenseId: int().notNull(),
	centerLat: decimal({ precision: 10, scale: 7 }).notNull(),
	centerLng: decimal({ precision: 10, scale: 7 }).notNull(),
	radiusMiles: int().notNull(),
	territoryName: varchar({ length: 255 }).notNull(),
	zipCode: varchar({ length: 20 }),
	city: varchar({ length: 100 }),
	state: varchar({ length: 50 }),
	status: mysqlEnum(['pending','active','expired']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	renewalDate: timestamp({ mode: 'string' }),
	expirationDate: timestamp({ mode: 'string' }),
});

export const commissions = mysqlTable("commissions", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	saleId: int().notNull(),
	sourceDistributorId: int(),
	commissionType: mysqlEnum(['direct','team','rank_bonus','leadership']).notNull(),
	level: int().notNull(),
	amount: int().notNull(),
	percentage: int().notNull(),
	status: mysqlEnum(['pending','paid','cancelled']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const crowdfunding = mysqlTable("crowdfunding", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	amount: int().notNull(),
	rewardTier: varchar({ length: 100 }),
	status: mysqlEnum(['pending','completed','refunded']).default('pending').notNull(),
	message: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const customerReferralCodes = mysqlTable("customer_referral_codes", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	code: varchar({ length: 50 }).notNull(),
	usageCount: int().default(0).notNull(),
	successfulReferrals: int().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("customer_referral_codes_code_unique").on(table.code),
]);

export const customerReferrals = mysqlTable("customer_referrals", {
	id: int().autoincrement().notNull(),
	referrerId: int().notNull(),
	referredId: int().notNull(),
	referralCode: varchar({ length: 50 }).notNull(),
	purchaseCompleted: tinyint().default(0),
	orderId: int(),
	purchaseAmount: decimal({ precision: 10, scale: 2 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	purchaseCompletedAt: timestamp({ mode: 'string' }),
});

export const customerRewards = mysqlTable("customer_rewards", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	rewardType: varchar({ length: 50 }).notNull(),
	description: varchar({ length: 255 }).notNull(),
	value: decimal({ precision: 10, scale: 2 }).notNull(),
	referralCount: int().default(3),
	status: mysqlEnum(['pending','available','redeemed','expired']).default('available').notNull(),
	redemptionCode: varchar({ length: 50 }),
	redeemedAt: timestamp({ mode: 'string' }),
	redeemedOrderId: int(),
	expiresAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const dataBackups = mysqlTable("data_backups", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	backupType: mysqlEnum(['full','incremental','table_specific','manual']).default('manual').notNull(),
	tablesIncluded: text().notNull(),
	totalRecords: int().default(0).notNull(),
	backupFileUrl: varchar({ length: 500 }),
	fileSizeBytes: int().default(0).notNull(),
	status: mysqlEnum(['in_progress','completed','failed','expired']).default('in_progress').notNull(),
	errorMessage: text(),
	retentionDays: int().default(30).notNull(),
	expiresAt: timestamp({ mode: 'string' }),
	createdBy: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
});

export const deletedRecordsArchive = mysqlTable("deleted_records_archive", {
	id: int().autoincrement().notNull(),
	tableName: varchar({ length: 100 }).notNull(),
	originalId: int().notNull(),
	recordData: text().notNull(),
	deletionReason: varchar({ length: 255 }),
	deletedBy: int(),
	canRestore: tinyint().default(1).notNull(),
	restoreDeadline: timestamp({ mode: 'string' }),
	wasRestored: tinyint().default(0).notNull(),
	restoredAt: timestamp({ mode: 'string' }),
	restoredBy: int(),
	deletedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const distributorAutoships = mysqlTable("distributor_autoships", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	userId: int().notNull(),
	name: varchar({ length: 255 }).default('Monthly Autoship'),
	status: mysqlEnum(['active','paused','cancelled']).default('active').notNull(),
	processDay: int().default(1).notNull(),
	totalPv: int().default(0).notNull(),
	totalPrice: int().default(0).notNull(),
	paymentMethodId: varchar({ length: 255 }),
	stripeCustomerId: varchar({ length: 255 }),
	shippingAddress1: text(),
	shippingAddress2: text(),
	shippingCity: varchar({ length: 100 }),
	shippingState: varchar({ length: 100 }),
	shippingPostalCode: varchar({ length: 20 }),
	shippingCountry: varchar({ length: 100 }).default('USA'),
	nextProcessDate: timestamp({ mode: 'string' }),
	lastProcessedDate: timestamp({ mode: 'string' }),
	successfulOrders: int().default(0),
	failedAttempts: int().default(0),
	lastFailureReason: text(),
	reminderSent: int().default(0),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const distributorFreeRewards = mysqlTable("distributor_free_rewards", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	pointsRedeemed: int().default(3).notNull(),
	earnedMonth: varchar({ length: 7 }).notNull(),
	status: mysqlEnum(['pending','shipped','delivered']).default('pending').notNull(),
	trackingNumber: varchar({ length: 100 }),
	shippedAt: timestamp({ mode: 'string' }),
	deliveredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const distributorRewardPoints = mysqlTable("distributor_reward_points", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	points: int().default(0).notNull(),
	source: varchar({ length: 50 }).notNull(),
	description: varchar({ length: 255 }),
	relatedId: int(),
	periodMonth: varchar({ length: 7 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const distributors = mysqlTable("distributors", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	sponsorId: int(),
	distributorCode: varchar({ length: 50 }).notNull(),
	rank: mysqlEnum(['starter','bronze','silver','gold','platinum','diamond','crown_diamond','royal_diamond']).default('starter').notNull(),
	personalSales: int().default(0).notNull(),
	teamSales: int().default(0).notNull(),
	totalEarnings: int().default(0).notNull(),
	availableBalance: int().default(0).notNull(),
	status: mysqlEnum(['active','inactive','suspended']).default('active').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	placementPosition: mysqlEnum(['left','right']),
	username: varchar({ length: 50 }),
	subdomain: varchar({ length: 50 }),
	leftLegVolume: int().default(0).notNull(),
	rightLegVolume: int().default(0).notNull(),
	monthlyPv: int().default(0).notNull(),
	monthlyAutoshipPv: int().default(0).notNull(),
	activeDownlineCount: int().default(0).notNull(),
	isActive: int().default(0).notNull(),
	lastQualificationDate: timestamp({ mode: 'string' }),
	fastStartEligibleUntil: timestamp({ mode: 'string' }),
	country: varchar({ length: 2 }),
	phone: varchar({ length: 50 }),
	address: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	zipCode: varchar({ length: 20 }),
	dateOfBirth: varchar({ length: 20 }),
	taxIdLast4: varchar({ length: 4 }),
	agreedToPoliciesAt: timestamp({ mode: 'string' }),
	agreedToTermsAt: timestamp({ mode: 'string' }),
	taxId: varchar({ length: 255 }),
	taxIdType: mysqlEnum(['ssn','ein']),
	entityType: mysqlEnum(['individual','sole_proprietor','llc','s_corp','c_corp','partnership']),
	businessName: varchar({ length: 255 }),
	businessRegistrationNumber: varchar({ length: 50 }),
	businessRegistrationState: varchar({ length: 50 }),
	emergencyContactName: varchar({ length: 255 }),
	emergencyContactPhone: varchar({ length: 50 }),
	emergencyContactRelationship: varchar({ length: 100 }),
	bankName: varchar({ length: 255 }),
	bankAccountType: mysqlEnum(['checking','savings']),
	bankAccountLast4: varchar({ length: 4 }),
	bankRoutingNumber: varchar({ length: 255 }),
	bankAccountNumber: varchar({ length: 255 }),
	enrollmentPackage: mysqlEnum(['starter','pro','elite']),
	autoshipEnabled: tinyint().default(0).notNull(),
	autoshipPackageId: int(),
	nextAutoshipDate: timestamp({ mode: 'string' }),
	taxInfoCompleted: tinyint().default(0).notNull(),
	taxInfoCompletedAt: timestamp({ mode: 'string' }),
	w9Submitted: tinyint().default(0).notNull(),
	w9SubmittedAt: timestamp({ mode: 'string' }),
	enrollmentPackageId: int(),
	firstName: varchar({ length: 255 }),
	lastName: varchar({ length: 255 }),
	email: varchar({ length: 255 }),
	ssnLast4: varchar({ length: 4 }),
	einLast4: varchar({ length: 4 }),
	businessEntityType: varchar({ length: 100 }),
	businessEin: varchar({ length: 50 }),
},
(table) => [
	index("distributors_userId_unique").on(table.userId),
	index("distributors_distributorCode_unique").on(table.distributorCode),
	index("distributors_username_unique").on(table.username),
	index("distributors_subdomain_unique").on(table.subdomain),
]);

export const emailDigestQueue = mysqlTable("email_digest_queue", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	notificationType: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	content: text().notNull(),
	relatedId: int(),
	processed: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const enrollmentPackages = mysqlTable("enrollmentPackages", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	slug: varchar({ length: 100 }).notNull(),
	description: text(),
	price: int().notNull(),
	businessVolume: int().default(0).notNull(),
	productQuantity: int().default(0).notNull(),
	productDetails: text(),
	marketingMaterialsIncluded: tinyint().default(0).notNull(),
	trainingAccessLevel: mysqlEnum(['basic','advanced','premium']).default('basic').notNull(),
	fastStartBonusEligible: tinyint().default(0).notNull(),
	isActive: tinyint().default(1).notNull(),
	displayOrder: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("enrollmentPackages_slug_unique").on(table.slug),
]);

export const franchiseApplications = mysqlTable("franchise_applications", {
	id: int().autoincrement().notNull(),
	firstName: varchar({ length: 100 }).notNull(),
	lastName: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	territoryCity: varchar({ length: 100 }).notNull(),
	territoryState: varchar({ length: 100 }).notNull(),
	territorySize: varchar({ length: 50 }).notNull(),
	exclusivityType: varchar({ length: 50 }).notNull(),
	investmentCapital: varchar({ length: 50 }).notNull(),
	financingNeeded: varchar({ length: 50 }),
	netWorth: varchar({ length: 50 }),
	businessExperience: varchar({ length: 100 }).notNull(),
	distributionExperience: text(),
	teamSize: varchar({ length: 50 }),
	motivation: text().notNull(),
	timeline: varchar({ length: 50 }).notNull(),
	questions: text(),
	status: mysqlEnum(['pending','under_review','approved','rejected']).default('pending').notNull(),
	adminNotes: text(),
	submittedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	reviewedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const investorInquiries = mysqlTable("investor_inquiries", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	company: varchar({ length: 255 }),
	investmentRange: mysqlEnum(['under_10k','10k_50k','50k_100k','100k_500k','500k_1m','over_1m']).notNull(),
	accreditedStatus: mysqlEnum(['yes','no','unsure']).notNull(),
	investmentType: mysqlEnum(['equity','convertible_note','revenue_share','franchise','other']).notNull(),
	referralSource: varchar({ length: 255 }),
	message: text(),
	status: mysqlEnum(['new','contacted','in_discussion','committed','declined']).default('new').notNull(),
	adminNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const maintenanceRequests = mysqlTable("maintenance_requests", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	requesterId: int().notNull(),
	requestType: mysqlEnum(['repair','restock','cleaning','inspection','relocation','upgrade']).notNull(),
	priority: mysqlEnum(['low','medium','high','urgent']).default('medium').notNull(),
	title: varchar({ length: 200 }).notNull(),
	description: text(),
	photos: text(),
	status: mysqlEnum(['pending','assigned','in_progress','completed','cancelled']).default('pending').notNull(),
	assignedTo: int(),
	scheduledDate: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	serviceNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const mfaRecoveryRequests = mysqlTable("mfa_recovery_requests", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	email: varchar({ length: 320 }).notNull(),
	recoveryToken: varchar({ length: 64 }).notNull(),
	tokenExpiry: timestamp({ mode: 'string' }).notNull(),
	status: mysqlEnum(['pending','email_verified','approved','rejected','completed','expired']).default('pending').notNull(),
	verificationAnswers: text(),
	adminNotes: text(),
	processedBy: int(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("mfa_recovery_requests_recoveryToken_unique").on(table.recoveryToken),
]);

export const mfaSettings = mysqlTable("mfa_settings", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	totpSecret: varchar({ length: 255 }).notNull(),
	isEnabled: tinyint().default(0).notNull(),
	backupCodes: text(),
	backupCodesRemaining: int().default(10).notNull(),
	lastVerifiedAt: timestamp({ mode: 'string' }),
	failedAttempts: int().default(0).notNull(),
	lockedUntil: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("mfa_settings_userId_unique").on(table.userId),
]);

export const neonNfts = mysqlTable("neon_nfts", {
	id: int().autoincrement().notNull(),
	orderId: int(),
	preorderId: int(),
	crowdfundingId: int(),
	userId: int(),
	tokenId: int().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	imageUrl: varchar({ length: 500 }),
	rarity: mysqlEnum(['legendary','epic','rare','uncommon','common']).notNull(),
	rarityRank: int().notNull(),
	estimatedValue: decimal({ precision: 10, scale: 2 }),
	ownerEmail: varchar({ length: 320 }),
	ownerName: varchar({ length: 255 }),
	packageType: varchar({ length: 100 }),
	txHash: varchar({ length: 100 }),
	blockchainStatus: mysqlEnum(['pending','minted','transferred']).default('pending').notNull(),
	mintedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("neon_nfts_tokenId_unique").on(table.tokenId),
]);

export const newsletterSubscriptions = mysqlTable("newsletter_subscriptions", {
	id: int().autoincrement().notNull(),
	email: varchar({ length: 320 }).notNull(),
	name: varchar({ length: 255 }),
	referrerId: int(),
	discountTier: int().default(1).notNull(),
	referralCount: int().default(0).notNull(),
	status: mysqlEnum(['active','unsubscribed']).default('active').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	couponCode: varchar({ length: 20 }),
	couponUsed: tinyint().default(0).notNull(),
	couponUsedBy: int(),
	couponUsedAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("newsletter_subscriptions_email_unique").on(table.email),
	index("newsletter_subscriptions_couponCode_unique").on(table.couponCode),
]);

export const notificationPreferences = mysqlTable("notification_preferences", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	referrals: tinyint().default(1).notNull(),
	commissions: tinyint().default(1).notNull(),
	teamUpdates: tinyint().default(1).notNull(),
	promotions: tinyint().default(1).notNull(),
	orders: tinyint().default(1).notNull(),
	announcements: tinyint().default(1).notNull(),
	digestFrequency: mysqlEnum(['none','daily','weekly']).default('none').notNull(),
	digestDay: int().default(1),
	digestHour: int().default(9),
	lastDigestSent: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	type: varchar({ length: 50 }).notNull(),
	title: varchar({ length: 255 }).notNull(),
	message: text().notNull(),
	data: text(),
	isRead: tinyint().default(0),
	readAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const orders = mysqlTable("orders", {
	id: int().autoincrement().notNull(),
	userId: int(),
	distributorId: int(),
	packageId: int().notNull(),
	orderNumber: varchar({ length: 50 }).notNull(),
	customerName: varchar({ length: 255 }).notNull(),
	customerEmail: varchar({ length: 320 }).notNull(),
	shippingAddress: text().notNull(),
	totalAmount: decimal({ precision: 10, scale: 2 }).notNull(),
	pv: int().notNull(),
	status: mysqlEnum(['pending','paid','shipped','delivered','cancelled']).default('pending').notNull(),
	stripePaymentId: varchar({ length: 255 }),
	isAutoShip: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("orders_orderNumber_unique").on(table.orderNumber),
]);

export const packages = mysqlTable("packages", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	type: mysqlEnum(['distributor','customer']).notNull(),
	tier: mysqlEnum(['starter','pro','elite','single','12pack','24pack']).notNull(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	pv: int().notNull(),
	description: text(),
	contents: text(),
	active: int().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const payoutHistory = mysqlTable("payout_history", {
	id: int().autoincrement().notNull(),
	payoutRequestId: int().notNull(),
	distributorId: int().notNull(),
	amount: int().notNull(),
	payoutMethod: varchar({ length: 50 }).notNull(),
	transactionRef: varchar({ length: 255 }),
	periodStart: timestamp({ mode: 'string' }),
	periodEnd: timestamp({ mode: 'string' }),
	commissionsIncluded: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const payoutRequests = mysqlTable("payout_requests", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	amount: int().notNull(),
	processingFee: int().default(0),
	netAmount: int().notNull(),
	payoutMethod: mysqlEnum(['stripe_connect','paypal','bank_transfer','check']).notNull(),
	status: mysqlEnum(['pending','approved','processing','completed','failed','cancelled']).default('pending').notNull(),
	stripeTransferId: varchar({ length: 255 }),
	paypalPayoutId: varchar({ length: 255 }),
	checkNumber: varchar({ length: 50 }),
	approvedBy: int(),
	approvedAt: timestamp({ mode: 'string' }),
	processedAt: timestamp({ mode: 'string' }),
	completedAt: timestamp({ mode: 'string' }),
	failureReason: text(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const payoutSettings = mysqlTable("payout_settings", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	payoutMethod: mysqlEnum(['stripe_connect','paypal','bank_transfer','check']).default('stripe_connect').notNull(),
	stripeConnectAccountId: varchar({ length: 255 }),
	stripeConnectStatus: mysqlEnum(['pending','onboarding','active','restricted','disabled']).default('pending'),
	paypalEmail: varchar({ length: 320 }),
	bankAccountName: varchar({ length: 255 }),
	bankRoutingNumber: varchar({ length: 255 }),
	bankAccountLast4: varchar({ length: 4 }),
	bankAccountType: mysqlEnum(['checking','savings']).default('checking'),
	checkMailingAddress: text(),
	minimumPayout: int().default(5000).notNull(),
	payoutFrequency: mysqlEnum(['weekly','biweekly','monthly']).default('weekly').notNull(),
	taxFormSubmitted: int().default(0),
	taxIdLast4: varchar({ length: 4 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("payout_settings_distributorId_unique").on(table.distributorId),
]);

export const preorders = mysqlTable("preorders", {
	id: int().autoincrement().notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	quantity: int().notNull(),
	address: text().notNull(),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 100 }).notNull(),
	postalCode: varchar({ length: 20 }).notNull(),
	country: varchar({ length: 100 }).default('USA').notNull(),
	status: mysqlEnum(['pending','confirmed','shipped','delivered','cancelled']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	trackingNumber: varchar({ length: 100 }),
	carrier: varchar({ length: 50 }),
	estimatedDelivery: timestamp({ mode: 'string' }),
	nftId: varchar({ length: 50 }),
	nftImageUrl: text(),
	nftMintStatus: mysqlEnum(['pending','ready','minted']).default('pending'),
	nftRarity: varchar({ length: 50 }),
	nftTheme: text(),
});

export const pushSubscriptions = mysqlTable("push_subscriptions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	endpoint: text().notNull(),
	p256Dh: text().notNull(),
	auth: text().notNull(),
	userAgent: text(),
	isActive: tinyint().default(1).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const rankHistory = mysqlTable("rank_history", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	previousRank: varchar({ length: 50 }).notNull(),
	newRank: varchar({ length: 50 }).notNull(),
	personalPvAtChange: int().default(0),
	teamPvAtChange: int().default(0),
	notificationSent: tinyint().default(0),
	achievedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const referralTracking = mysqlTable("referral_tracking", {
	id: int().autoincrement().notNull(),
	referrerId: varchar({ length: 50 }).notNull(),
	referrerName: varchar({ length: 255 }),
	referralCode: varchar({ length: 50 }).notNull(),
	referredPhone: varchar({ length: 50 }),
	referredEmail: varchar({ length: 320 }),
	referredName: varchar({ length: 255 }),
	source: mysqlEnum(['sms','email','social','direct','whatsapp','twitter','facebook']).default('direct').notNull(),
	status: mysqlEnum(['pending','clicked','signed_up','customer','distributor']).default('pending').notNull(),
	convertedToCustomer: int().default(0).notNull(),
	convertedToDistributor: int().default(0).notNull(),
	customerOrderId: int(),
	distributorId: int(),
	bonusPaid: int().default(0).notNull(),
	bonusAmount: int().default(0).notNull(),
	clickedAt: timestamp({ mode: 'string' }),
	signedUpAt: timestamp({ mode: 'string' }),
	convertedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const replicatedWebsites = mysqlTable("replicated_websites", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	subdomain: varchar({ length: 100 }).notNull(),
	vanitySlug: varchar({ length: 50 }),
	affiliateLink: varchar({ length: 500 }).notNull(),
	affiliateCode: varchar({ length: 50 }).notNull(),
	status: mysqlEnum(['provisioning','active','suspended','inactive']).default('provisioning').notNull(),
	provisioningStatus: mysqlEnum(['pending','subdomain_assigned','tracking_configured','verified','failed']).default('pending').notNull(),
	lastVerifiedAt: timestamp({ mode: 'string' }),
	verificationError: text(),
	bio: text(),
	profilePhotoUrl: varchar({ length: 500 }),
	location: varchar({ length: 255 }),
	headline: varchar({ length: 255 }),
	socialLinks: text(),
	themeColor: varchar({ length: 20 }).default('#c8ff00'),
	totalViews: int().default(0).notNull(),
	uniqueVisitors: int().default(0).notNull(),
	totalSignups: int().default(0).notNull(),
	totalSales: int().default(0).notNull(),
	totalRevenue: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("replicated_websites_distributorId_unique").on(table.distributorId),
	index("replicated_websites_subdomain_unique").on(table.subdomain),
	index("replicated_websites_vanitySlug_unique").on(table.vanitySlug),
	index("replicated_websites_affiliateCode_unique").on(table.affiliateCode),
]);

export const restorationLog = mysqlTable("restoration_log", {
	id: int().autoincrement().notNull(),
	backupId: int().notNull(),
	restorationType: mysqlEnum(['full','partial','single_record']).notNull(),
	tablesRestored: text(),
	recordsRestored: int().default(0).notNull(),
	status: mysqlEnum(['in_progress','completed','failed','rolled_back']).default('in_progress').notNull(),
	errorMessage: text(),
	performedBy: int().notNull(),
	startedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	completedAt: timestamp({ mode: 'string' }),
});

export const rewardRedemptions = mysqlTable("reward_redemptions", {
	id: int().autoincrement().notNull(),
	rewardId: int().notNull(),
	rewardType: mysqlEnum(['customer','distributor']).notNull(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	addressLine1: text().notNull(),
	addressLine2: text(),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 100 }).notNull(),
	postalCode: varchar({ length: 20 }).notNull(),
	country: varchar({ length: 100 }).notNull(),
	status: mysqlEnum(['pending','processing','shipped','delivered']).default('pending').notNull(),
	trackingNumber: varchar({ length: 100 }),
	shippedAt: timestamp({ mode: 'string' }),
	deliveredAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const sales = mysqlTable("sales", {
	id: int().autoincrement().notNull(),
	distributorId: int(),
	customerId: int(),
	customerEmail: varchar({ length: 320 }).notNull(),
	orderTotal: int().notNull(),
	commissionVolume: int().notNull(),
	saleType: mysqlEnum(['retail','distributor','autoship']).default('retail').notNull(),
	paymentStatus: mysqlEnum(['pending','completed','refunded']).default('pending').notNull(),
	orderDetails: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const scheduledMeetings = mysqlTable("scheduled_meetings", {
	id: int().autoincrement().notNull(),
	userId: int(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	meetingType: mysqlEnum(['franchise','vending','general']).notNull(),
	scheduledAt: timestamp({ mode: 'string' }).notNull(),
	durationMinutes: int().default(30).notNull(),
	timezone: varchar({ length: 100 }).default('America/New_York').notNull(),
	status: mysqlEnum(['scheduled','confirmed','completed','cancelled','no_show']).default('scheduled').notNull(),
	notes: text(),
	adminNotes: text(),
	meetingLink: text(),
	reminderSent: tinyint().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const smsMessageLog = mysqlTable("sms_message_log", {
	id: int().autoincrement().notNull(),
	phone: varchar({ length: 50 }).notNull(),
	recipientName: varchar({ length: 255 }),
	messageType: mysqlEnum(['order_confirmation','shipping_update','delivery_confirmation','territory_submitted','territory_approved','territory_rejected','referral_invite','welcome','nft_minted','crowdfund_contribution','promotional']).notNull(),
	messageContent: text().notNull(),
	messageId: varchar({ length: 100 }),
	status: mysqlEnum(['pending','sent','delivered','failed']).default('pending').notNull(),
	errorMessage: text(),
	sentAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	deliveredAt: timestamp({ mode: 'string' }),
});

export const smsOptIns = mysqlTable("sms_opt_ins", {
	id: int().autoincrement().notNull(),
	userId: int(),
	phone: varchar({ length: 50 }).notNull(),
	email: varchar({ length: 320 }),
	name: varchar({ length: 255 }),
	subscriberId: varchar({ length: 50 }).notNull(),
	referralCode: varchar({ length: 50 }).notNull(),
	referredBy: varchar({ length: 50 }),
	optedIn: int().default(1).notNull(),
	optInDate: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP'),
	optOutDate: timestamp({ mode: 'string' }),
	prefOrderUpdates: int().default(1).notNull(),
	prefPromotions: int().default(1).notNull(),
	prefReferralAlerts: int().default(1).notNull(),
	prefTerritoryUpdates: int().default(1).notNull(),
	totalReferrals: int().default(0).notNull(),
	customersReferred: int().default(0).notNull(),
	distributorsReferred: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("sms_opt_ins_subscriberId_unique").on(table.subscriberId),
	index("sms_opt_ins_referralCode_unique").on(table.referralCode),
]);

export const systemAuditLog = mysqlTable("system_audit_log", {
	id: int().autoincrement().notNull(),
	category: mysqlEnum(['user','distributor','order','commission','website','backup','restore','admin','security','system']).notNull(),
	action: varchar({ length: 100 }).notNull(),
	entityType: varchar({ length: 50 }).notNull(),
	entityId: int(),
	userId: int(),
	userRole: varchar({ length: 50 }),
	ipAddress: varchar({ length: 45 }),
	userAgent: varchar({ length: 500 }),
	previousState: text(),
	newState: text(),
	metadata: text(),
	result: mysqlEnum(['success','failure','partial']).default('success').notNull(),
	errorMessage: text(),
	severity: mysqlEnum(['info','warning','error','critical']).default('info').notNull(),
	isReversible: tinyint().default(0).notNull(),
	relatedEntries: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const territoryApplications = mysqlTable("territory_applications", {
	id: int().autoincrement().notNull(),
	userId: int(),
	currentStep: int().default(1).notNull(),
	centerLat: decimal({ precision: 10, scale: 7 }),
	centerLng: decimal({ precision: 10, scale: 7 }),
	radiusMiles: int(),
	territoryName: varchar({ length: 255 }),
	estimatedPopulation: int(),
	termMonths: int(),
	totalCost: int(),
	firstName: varchar({ length: 100 }),
	lastName: varchar({ length: 100 }),
	email: varchar({ length: 320 }),
	phone: varchar({ length: 50 }),
	dateOfBirth: varchar({ length: 20 }),
	streetAddress: varchar({ length: 255 }),
	city: varchar({ length: 100 }),
	state: varchar({ length: 50 }),
	zipCode: varchar({ length: 20 }),
	businessName: varchar({ length: 255 }),
	businessType: mysqlEnum(['individual','llc','corporation','partnership']),
	taxId: varchar({ length: 50 }),
	yearsInBusiness: int(),
	investmentCapital: int(),
	franchiseExperience: text(),
	whyInterested: text(),
	agreedToTerms: int().default(0).notNull(),
	signature: varchar({ length: 255 }),
	submittedAt: timestamp({ mode: 'string' }),
	status: mysqlEnum(['draft','submitted','under_review','approved','rejected']).default('draft').notNull(),
	adminNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const territoryLicenses = mysqlTable("territory_licenses", {
	id: int().autoincrement().notNull(),
	userId: int(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	territory: text().notNull(),
	coordinates: text(),
	squareMiles: int().notNull(),
	termMonths: int().notNull(),
	pricePerSqMile: int().notNull(),
	totalCost: int().notNull(),
	depositAmount: int(),
	financing: mysqlEnum(['full','deposit','monthly']).default('full').notNull(),
	status: mysqlEnum(['pending','approved','rejected','active']).default('pending').notNull(),
	notes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const territoryReservations = mysqlTable("territory_reservations", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	territoryName: varchar({ length: 255 }).notNull(),
	state: varchar({ length: 2 }).notNull(),
	centerLat: decimal({ precision: 10, scale: 7 }).notNull(),
	centerLng: decimal({ precision: 10, scale: 7 }).notNull(),
	radiusMiles: decimal({ precision: 10, scale: 2 }).notNull(),
	areaSqMiles: decimal({ precision: 10, scale: 2 }).notNull(),
	population: int().notNull(),
	licenseFee: int().notNull(),
	status: mysqlEnum(['active','expired','converted','cancelled']).default('active').notNull(),
	expiresAt: timestamp({ mode: 'string' }).notNull(),
	reminderSent: tinyint().default(0).notNull(),
	convertedToLicenseId: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const userProfiles = mysqlTable("user_profiles", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	customSlug: varchar({ length: 100 }),
	profilePhotoUrl: text(),
	displayName: varchar({ length: 255 }),
	location: varchar({ length: 255 }),
	bio: text(),
	userType: mysqlEnum(['distributor','customer']).notNull(),
	isPublished: tinyint().default(1).notNull(),
	pageViews: int().default(0).notNull(),
	signupsGenerated: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	instagram: varchar({ length: 100 }),
	tiktok: varchar({ length: 100 }),
	facebook: varchar({ length: 255 }),
	twitter: varchar({ length: 100 }),
	youtube: varchar({ length: 255 }),
	linkedin: varchar({ length: 255 }),
	country: varchar({ length: 2 }),
},
(table) => [
	index("user_profiles_userId_unique").on(table.userId),
	index("user_profiles_customSlug_unique").on(table.customSlug),
]);

export const users = mysqlTable("users", {
	id: int().autoincrement().notNull(),
	openId: varchar({ length: 64 }).notNull(),
	name: text(),
	email: varchar({ length: 320 }),
	loginMethod: varchar({ length: 64 }),
	role: mysqlEnum(['user','admin']).default('user').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
	lastSignedIn: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	phone: varchar({ length: 50 }),
	addressLine1: text(),
	addressLine2: text(),
	city: varchar({ length: 100 }),
	state: varchar({ length: 100 }),
	postalCode: varchar({ length: 20 }),
	country: varchar({ length: 100 }),
	emailVerified: tinyint().default(0).notNull(),
	emailVerificationToken: varchar({ length: 64 }),
	emailVerificationExpiry: timestamp({ mode: 'string' }),
	phoneVerified: tinyint().default(0).notNull(),
	smsVerificationCode: varchar({ length: 6 }),
	smsVerificationExpiry: timestamp({ mode: 'string' }),
	smsVerificationAttempts: int().default(0).notNull(),
	lastSmsSentAt: timestamp({ mode: 'string' }),
	username: varchar({ length: 50 }),
	passwordHash: varchar({ length: 255 }),
	userType: mysqlEnum(['customer','distributor','franchisee','admin']).default('customer').notNull(),
	passwordResetToken: varchar({ length: 64 }),
	passwordResetExpiry: timestamp({ mode: 'string' }),
},
(table) => [
	index("users_openId_unique").on(table.openId),
]);

export const vendingAlerts = mysqlTable("vending_alerts", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	alertType: mysqlEnum(['low_stock','temperature','offline','door_open','payment_error','maintenance_due','error']).notNull(),
	severity: mysqlEnum(['info','warning','critical']).default('info').notNull(),
	title: varchar({ length: 200 }).notNull(),
	message: text(),
	acknowledged: tinyint().default(0).notNull(),
	acknowledgedBy: int(),
	acknowledgedAt: timestamp({ mode: 'string' }),
	resolved: tinyint().default(0).notNull(),
	resolvedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const vendingApplications = mysqlTable("vending_applications", {
	id: int().autoincrement().notNull(),
	firstName: varchar({ length: 100 }).notNull(),
	lastName: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }).notNull(),
	businessName: varchar({ length: 255 }),
	businessType: varchar({ length: 100 }).notNull(),
	yearsInBusiness: varchar({ length: 50 }),
	city: varchar({ length: 100 }).notNull(),
	state: varchar({ length: 100 }).notNull(),
	zipCode: varchar({ length: 20 }).notNull(),
	proposedLocations: text(),
	numberOfMachines: varchar({ length: 50 }).notNull(),
	investmentBudget: varchar({ length: 50 }),
	timeline: varchar({ length: 50 }),
	experience: text(),
	questions: text(),
	status: mysqlEnum(['pending','under_review','approved','rejected']).default('pending').notNull(),
	adminNotes: text(),
	submittedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	reviewedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const vendingCommissions = mysqlTable("vending_commissions", {
	id: int().autoincrement().notNull(),
	userId: int().notNull(),
	sourceMachineId: int(),
	commissionType: mysqlEnum(['direct_referral','network_cv','bonus']).notNull(),
	amountCents: int().notNull(),
	cvAmount: int().default(0).notNull(),
	commissionRate: int().notNull(),
	periodStart: timestamp({ mode: 'string' }).notNull(),
	periodEnd: timestamp({ mode: 'string' }).notNull(),
	status: mysqlEnum(['pending','approved','paid','cancelled']).default('pending').notNull(),
	paidAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const vendingInventory = mysqlTable("vending_inventory", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	slotNumber: int().notNull(),
	productName: varchar({ length: 100 }).notNull(),
	productSku: varchar({ length: 50 }).notNull(),
	currentStock: int().default(0).notNull(),
	maxCapacity: int().default(10).notNull(),
	lowStockThreshold: int().default(3).notNull(),
	priceInCents: int().notNull(),
	lastRestockedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const vendingMachineOrders = mysqlTable("vending_machine_orders", {
	id: int().autoincrement().notNull(),
	userId: int(),
	name: varchar({ length: 255 }).notNull(),
	email: varchar({ length: 320 }).notNull(),
	phone: varchar({ length: 50 }),
	machineModel: varchar({ length: 100 }).notNull(),
	quantity: int().default(1).notNull(),
	totalPriceCents: int().notNull(),
	depositAmountCents: int().notNull(),
	paymentType: mysqlEnum(['full','deposit','payment_plan']).notNull(),
	paymentPlanMonths: int(),
	monthlyPaymentCents: int(),
	amountPaidCents: int().default(0).notNull(),
	remainingBalanceCents: int().notNull(),
	paymentsMade: int().default(0).notNull(),
	nextPaymentDue: timestamp({ mode: 'string' }),
	stripeCustomerId: varchar({ length: 255 }),
	stripeSubscriptionId: varchar({ length: 255 }),
	stripePaymentIntentId: varchar({ length: 255 }),
	status: mysqlEnum(['pending','deposit_paid','in_production','ready_for_delivery','delivered','cancelled','refunded']).default('pending').notNull(),
	deliveryAddress: text(),
	deliveryCity: varchar({ length: 100 }),
	deliveryState: varchar({ length: 100 }),
	deliveryZip: varchar({ length: 20 }),
	estimatedDelivery: timestamp({ mode: 'string' }),
	installationDate: timestamp({ mode: 'string' }),
	notes: text(),
	adminNotes: text(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
});

export const vendingMachines = mysqlTable("vending_machines", {
	id: int().autoincrement().notNull(),
	serialNumber: varchar({ length: 50 }).notNull(),
	nickname: varchar({ length: 100 }),
	ownerId: int().notNull(),
	territoryLicenseId: int(),
	model: varchar({ length: 100 }).default('NEON-VM-2000').notNull(),
	locationAddress: text(),
	locationLat: decimal({ precision: 10, scale: 7 }),
	locationLng: decimal({ precision: 10, scale: 7 }),
	locationType: mysqlEnum(['mall','gym','office','school','hospital','airport','hotel','gas_station','other']).default('other').notNull(),
	status: mysqlEnum(['online','offline','maintenance','error']).default('offline').notNull(),
	lastHeartbeat: timestamp({ mode: 'string' }),
	temperature: decimal({ precision: 5, scale: 2 }),
	temperatureStatus: mysqlEnum(['normal','warning','critical']).default('normal').notNull(),
	doorStatus: mysqlEnum(['closed','open','jammed']).default('closed').notNull(),
	paymentStatus: mysqlEnum(['operational','card_only','cash_only','offline']).default('operational').notNull(),
	totalSalesCount: int().default(0).notNull(),
	totalRevenue: int().default(0).notNull(),
	todaySalesCount: int().default(0).notNull(),
	todayRevenue: int().default(0).notNull(),
	installedAt: timestamp({ mode: 'string' }),
	lastMaintenanceAt: timestamp({ mode: 'string' }),
	nextMaintenanceAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("vending_machines_serialNumber_unique").on(table.serialNumber),
]);

export const vendingNetwork = mysqlTable("vending_network", {
	id: int().autoincrement().notNull(),
	machineId: varchar({ length: 50 }).notNull(),
	ownerId: int().notNull(),
	referrerId: int(),
	location: varchar({ length: 255 }).notNull(),
	status: mysqlEnum(['active','inactive','maintenance']).default('active').notNull(),
	monthlyRevenue: int().default(0).notNull(),
	totalSales: int().default(0).notNull(),
	commissionVolume: int().default(0).notNull(),
	networkLevel: int().default(0).notNull(),
	installedAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().onUpdateNow().notNull(),
},
(table) => [
	index("vending_network_machineId_unique").on(table.machineId),
]);

export const vendingPaymentHistory = mysqlTable("vending_payment_history", {
	id: int().autoincrement().notNull(),
	orderId: int().notNull(),
	amountCents: int().notNull(),
	paymentType: mysqlEnum(['deposit','monthly','final','full']).notNull(),
	paymentNumber: int(),
	stripePaymentIntentId: varchar({ length: 255 }),
	status: mysqlEnum(['pending','succeeded','failed','refunded']).default('pending').notNull(),
	paidAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const vendingSales = mysqlTable("vending_sales", {
	id: int().autoincrement().notNull(),
	machineId: int().notNull(),
	slotNumber: int().notNull(),
	productName: varchar({ length: 100 }).notNull(),
	productSku: varchar({ length: 50 }).notNull(),
	quantity: int().default(1).notNull(),
	amountInCents: int().notNull(),
	paymentMethod: mysqlEnum(['card','cash','mobile','free']).default('card').notNull(),
	transactionRef: varchar({ length: 100 }),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const websiteAnalytics = mysqlTable("website_analytics", {
	id: int().autoincrement().notNull(),
	websiteId: int().notNull(),
	eventType: mysqlEnum(['page_view','click','signup','purchase','share']).notNull(),
	pageUrl: varchar({ length: 500 }),
	referrerUrl: varchar({ length: 500 }),
	visitorHash: varchar({ length: 64 }),
	userAgent: varchar({ length: 500 }),
	country: varchar({ length: 2 }),
	deviceType: mysqlEnum(['desktop','mobile','tablet']).default('desktop'),
	sessionId: varchar({ length: 64 }),
	conversionValue: int(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

export const websiteAuditLog = mysqlTable("website_audit_log", {
	id: int().autoincrement().notNull(),
	websiteId: int().notNull(),
	action: mysqlEnum(['created','subdomain_assigned','tracking_configured','verified','verification_failed','auto_fixed','suspended','reactivated']).notNull(),
	previousStatus: varchar({ length: 50 }),
	newStatus: varchar({ length: 50 }),
	issueType: mysqlEnum(['missing_tracking','data_drift','subdomain_conflict','invalid_affiliate_link','none']).default('none'),
	issueSeverity: mysqlEnum(['low','medium','high','critical']).default('low'),
	autoFixed: tinyint().default(0),
	details: text(),
	performedBy: varchar({ length: 50 }).default('system'),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
});

// Binary Tree and Genealogy Tables
export const binaryTreePositions = mysqlTable("binary_tree_positions", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	parentId: int(), // Who they're placed under in the tree
	sponsorId: int().notNull(), // Who recruited them
	position: mysqlEnum(['left','right']).notNull(),
	depthLevel: int().default(0).notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("binary_tree_positions_distributorId_unique").on(table.distributorId),
	index("binary_tree_positions_parentId_idx").on(table.parentId),
	index("binary_tree_positions_sponsorId_idx").on(table.sponsorId),
]);

export const commissionTransactions = mysqlTable("commission_transactions", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	commissionType: mysqlEnum(['retail','binary','fast_start','rank_bonus','matching']).notNull(),
	amount: int().notNull(), // in cents
	sourceOrderId: int(),
	sourceDistributorId: int(), // for matching bonus
	calculationDetails: text(), // JSON with breakdown
	payoutCycle: date(), // which week/month this belongs to
	status: mysqlEnum(['pending','paid','cancelled']).default('pending').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	paidAt: timestamp({ mode: 'string' }),
},
(table) => [
	index("commission_transactions_distributorId_idx").on(table.distributorId),
	index("commission_transactions_payoutCycle_idx").on(table.payoutCycle),
	index("commission_transactions_status_idx").on(table.status),
]);

export const legVolumes = mysqlTable("leg_volumes", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	periodStart: date().notNull(),
	periodEnd: date().notNull(),
	leftLegVolume: int().default(0).notNull(), // in cents
	rightLegVolume: int().default(0).notNull(), // in cents
	leftLegPv: int().default(0).notNull(),
	rightLegPv: int().default(0).notNull(),
	carryForwardLeft: int().default(0).notNull(), // in cents
	carryForwardRight: int().default(0).notNull(), // in cents
	binaryCommissionPaid: int().default(0).notNull(), // in cents
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("leg_volumes_distributorId_idx").on(table.distributorId),
	index("leg_volumes_periodStart_idx").on(table.periodStart),
]);



export const charityImpactTracking = mysqlTable("charity_impact_tracking", {
	id: int().autoincrement().notNull(),
	distributorId: int().notNull(),
	periodStart: date().notNull(),
	periodEnd: date().notNull(),
	personalCansOriginal: int().default(0).notNull(),
	personalCansPink: int().default(0).notNull(),
	personalTreesProtected: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	personalHabitatProtected: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	personalSpeciesSaved: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	personalAnimalLivesSaved: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	teamCansOriginal: int().default(0).notNull(),
	teamCansPink: int().default(0).notNull(),
	teamTreesProtected: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	teamHabitatProtected: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	teamSpeciesSaved: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	teamAnimalLivesSaved: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	totalTreesProtected: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	totalHabitatProtected: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	totalSpeciesSaved: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	totalAnimalLivesSaved: decimal({ precision: 10, scale: 2 }).default('0').notNull(),
	createdAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
	updatedAt: timestamp({ mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
},
(table) => [
	index("charity_impact_tracking_distributorId_idx").on(table.distributorId),
	index("charity_impact_tracking_periodStart_idx").on(table.periodStart),
]);


// Type exports for Insert operations
export type User = typeof users.$inferSelect;
export type InsertTerritoryLicense = typeof territoryLicenses.$inferInsert;
export type InsertCrowdfunding = typeof crowdfunding.$inferInsert;
export type InsertNewsletterSubscription = typeof newsletterSubscriptions.$inferInsert;
export type InsertTerritoryApplication = typeof territoryApplications.$inferInsert;
export type InsertDistributorAutoship = typeof distributorAutoships.$inferInsert;
export type InsertAutoshipItem = typeof autoshipItems.$inferInsert;
export type InsertAutoshipOrder = typeof autoshipOrders.$inferInsert;
export type InsertPayoutSetting = typeof payoutSettings.$inferInsert;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;
export type InsertEmailDigestQueueItem = typeof emailDigestQueue.$inferInsert;
export type InsertMfaRecoveryRequest = typeof mfaRecoveryRequests.$inferInsert;
export type InsertPayoutRequest = typeof payoutRequests.$inferInsert;
export type InsertNotification = typeof notifications.$inferInsert;
export type InsertCustomerReferral = typeof customerReferrals.$inferInsert;
export type InsertCustomerReward = typeof customerRewards.$inferInsert;
export type InsertCustomerReferralCode = typeof customerReferralCodes.$inferInsert;
export type InsertDistributorRewardPoint = typeof distributorRewardPoints.$inferInsert;
export type InsertDistributorFreeReward = typeof distributorFreeRewards.$inferInsert;
export type InsertRewardRedemption = typeof rewardRedemptions.$inferInsert;
export type InsertVendingApplication = typeof vendingApplications.$inferInsert;
export type InsertFranchiseApplication = typeof franchiseApplications.$inferInsert;
export type InsertPushSubscription = typeof pushSubscriptions.$inferInsert;
export type InsertUserProfile = typeof userProfiles.$inferInsert;
export type InsertAffiliateLink = typeof affiliateLinks.$inferInsert;
export type InsertRankHistory = typeof rankHistory.$inferInsert;
export type InsertEmailDigestQueue = typeof emailDigestQueue.$inferInsert;
export type InsertVendingAlert = typeof vendingAlerts.$inferInsert;
export type InsertMfaSetting = typeof mfaSettings.$inferInsert;
export type InsertRankHistoryRecord = typeof rankHistory.$inferInsert;
export type InsertScheduledMeeting = typeof scheduledMeetings.$inferInsert;
export type InsertVendingMachineOrder = typeof vendingMachineOrders.$inferInsert;
export type InsertVendingPaymentHistory = typeof vendingPaymentHistory.$inferInsert;
export type InsertVendingNetwork = typeof vendingNetwork.$inferInsert;
export type InsertVendingCommission = typeof vendingCommissions.$inferInsert;
export type InsertReferralTracking = typeof referralTracking.$inferInsert;
export type InsertSMSMessageLog = typeof smsMessageLog.$inferInsert;
export type InsertTerritoryReservation = typeof territoryReservations.$inferInsert;

export type InsertPreorder = typeof preorders.$inferInsert;
export type InsertClaimedTerritory = typeof claimedTerritories.$inferInsert;
export type InsertNeonNft = typeof neonNfts.$inferInsert;
export type InsertInvestorInquiry = typeof investorInquiries.$inferInsert;
export type InsertBlogPost = typeof blogPosts.$inferInsert;
export type InsertSMSOptIn = typeof smsOptIns.$inferInsert;
export type InsertPayoutHistoryRecord = typeof payoutHistory.$inferInsert;
