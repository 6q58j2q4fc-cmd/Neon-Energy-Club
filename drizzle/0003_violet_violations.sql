CREATE TABLE `affiliate_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int NOT NULL,
	`linkCode` varchar(50) NOT NULL,
	`campaignName` varchar(255),
	`targetPath` varchar(500) NOT NULL DEFAULT '/',
	`clicks` int NOT NULL DEFAULT 0,
	`conversions` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `affiliate_links_id` PRIMARY KEY(`id`),
	CONSTRAINT `affiliate_links_linkCode_unique` UNIQUE(`linkCode`)
);
--> statement-breakpoint
CREATE TABLE `commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int NOT NULL,
	`saleId` int NOT NULL,
	`sourceDistributorId` int,
	`commissionType` enum('direct','team','rank_bonus','leadership') NOT NULL,
	`level` int NOT NULL,
	`amount` int NOT NULL,
	`percentage` int NOT NULL,
	`status` enum('pending','paid','cancelled') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distributors` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sponsorId` int,
	`distributorCode` varchar(50) NOT NULL,
	`rank` enum('starter','bronze','silver','gold','platinum','diamond') NOT NULL DEFAULT 'starter',
	`personalSales` int NOT NULL DEFAULT 0,
	`teamSales` int NOT NULL DEFAULT 0,
	`totalEarnings` int NOT NULL DEFAULT 0,
	`availableBalance` int NOT NULL DEFAULT 0,
	`status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distributors_id` PRIMARY KEY(`id`),
	CONSTRAINT `distributors_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `distributors_distributorCode_unique` UNIQUE(`distributorCode`)
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`name` varchar(255),
	`referrerId` int,
	`discountTier` int NOT NULL DEFAULT 1,
	`referralCount` int NOT NULL DEFAULT 0,
	`status` enum('active','unsubscribed') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `newsletter_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `newsletter_subscriptions_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int,
	`customerId` int,
	`customerEmail` varchar(320) NOT NULL,
	`orderTotal` int NOT NULL,
	`commissionVolume` int NOT NULL,
	`saleType` enum('retail','distributor','autoship') NOT NULL DEFAULT 'retail',
	`paymentStatus` enum('pending','completed','refunded') NOT NULL DEFAULT 'pending',
	`orderDetails` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sales_id` PRIMARY KEY(`id`)
);
