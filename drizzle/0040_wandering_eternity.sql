CREATE TABLE `enrollmentPackages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`slug` varchar(100) NOT NULL,
	`description` text,
	`price` int NOT NULL,
	`businessVolume` int NOT NULL DEFAULT 0,
	`productQuantity` int NOT NULL DEFAULT 0,
	`productDetails` text,
	`marketingMaterialsIncluded` boolean NOT NULL DEFAULT false,
	`trainingAccessLevel` enum('basic','advanced','premium') NOT NULL DEFAULT 'basic',
	`fastStartBonusEligible` boolean NOT NULL DEFAULT false,
	`isActive` boolean NOT NULL DEFAULT true,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `enrollmentPackages_id` PRIMARY KEY(`id`),
	CONSTRAINT `enrollmentPackages_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
ALTER TABLE `distributors` ADD `taxId` varchar(255);--> statement-breakpoint
ALTER TABLE `distributors` ADD `taxIdType` enum('ssn','ein');--> statement-breakpoint
ALTER TABLE `distributors` ADD `entityType` enum('individual','sole_proprietor','llc','s_corp','c_corp','partnership');--> statement-breakpoint
ALTER TABLE `distributors` ADD `businessName` varchar(255);--> statement-breakpoint
ALTER TABLE `distributors` ADD `businessRegistrationNumber` varchar(50);--> statement-breakpoint
ALTER TABLE `distributors` ADD `businessRegistrationState` varchar(50);--> statement-breakpoint
ALTER TABLE `distributors` ADD `emergencyContactName` varchar(255);--> statement-breakpoint
ALTER TABLE `distributors` ADD `emergencyContactPhone` varchar(50);--> statement-breakpoint
ALTER TABLE `distributors` ADD `emergencyContactRelationship` varchar(100);--> statement-breakpoint
ALTER TABLE `distributors` ADD `bankName` varchar(255);--> statement-breakpoint
ALTER TABLE `distributors` ADD `bankAccountType` enum('checking','savings');--> statement-breakpoint
ALTER TABLE `distributors` ADD `bankAccountLast4` varchar(4);--> statement-breakpoint
ALTER TABLE `distributors` ADD `bankRoutingNumber` varchar(255);--> statement-breakpoint
ALTER TABLE `distributors` ADD `bankAccountNumber` varchar(255);--> statement-breakpoint
ALTER TABLE `distributors` ADD `enrollmentPackage` enum('starter','pro','elite');--> statement-breakpoint
ALTER TABLE `distributors` ADD `autoshipEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `autoshipPackageId` int;--> statement-breakpoint
ALTER TABLE `distributors` ADD `nextAutoshipDate` timestamp;--> statement-breakpoint
ALTER TABLE `distributors` ADD `taxInfoCompleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `taxInfoCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `distributors` ADD `w9Submitted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `w9SubmittedAt` timestamp;