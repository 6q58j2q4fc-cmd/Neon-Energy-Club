CREATE TABLE `vending_commissions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sourceMachineId` int,
	`commissionType` enum('direct_referral','network_cv','bonus') NOT NULL,
	`amountCents` int NOT NULL,
	`cvAmount` int NOT NULL DEFAULT 0,
	`commissionRate` int NOT NULL,
	`periodStart` timestamp NOT NULL,
	`periodEnd` timestamp NOT NULL,
	`status` enum('pending','approved','paid','cancelled') NOT NULL DEFAULT 'pending',
	`paidAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vending_commissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vending_network` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` varchar(50) NOT NULL,
	`ownerId` int NOT NULL,
	`referrerId` int,
	`location` varchar(255) NOT NULL,
	`status` enum('active','inactive','maintenance') NOT NULL DEFAULT 'active',
	`monthlyRevenue` int NOT NULL DEFAULT 0,
	`totalSales` int NOT NULL DEFAULT 0,
	`commissionVolume` int NOT NULL DEFAULT 0,
	`networkLevel` int NOT NULL DEFAULT 0,
	`installedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vending_network_id` PRIMARY KEY(`id`),
	CONSTRAINT `vending_network_machineId_unique` UNIQUE(`machineId`)
);
