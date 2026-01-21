CREATE TABLE `customer_referral_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`usageCount` int NOT NULL DEFAULT 0,
	`successfulReferrals` int NOT NULL DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_referral_codes_id` PRIMARY KEY(`id`),
	CONSTRAINT `customer_referral_codes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `customer_referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredId` int NOT NULL,
	`referralCode` varchar(50) NOT NULL,
	`purchaseCompleted` boolean DEFAULT false,
	`orderId` int,
	`purchaseAmount` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`purchaseCompletedAt` timestamp,
	CONSTRAINT `customer_referrals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `customer_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`rewardType` varchar(50) NOT NULL,
	`description` varchar(255) NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`referralCount` int DEFAULT 3,
	`status` enum('pending','available','redeemed','expired') NOT NULL DEFAULT 'available',
	`redemptionCode` varchar(50),
	`redeemedAt` timestamp,
	`redeemedOrderId` int,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `customer_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distributor_free_rewards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int NOT NULL,
	`pointsRedeemed` int NOT NULL DEFAULT 3,
	`earnedMonth` varchar(7) NOT NULL,
	`status` enum('pending','shipped','delivered') NOT NULL DEFAULT 'pending',
	`trackingNumber` varchar(100),
	`shippedAt` timestamp,
	`deliveredAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `distributor_free_rewards_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distributor_reward_points` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int NOT NULL,
	`points` int NOT NULL DEFAULT 0,
	`source` varchar(50) NOT NULL,
	`description` varchar(255),
	`relatedId` int,
	`periodMonth` varchar(7) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `distributor_reward_points_id` PRIMARY KEY(`id`)
);
