CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`customSlug` varchar(100),
	`profilePhotoUrl` text,
	`displayName` varchar(255),
	`location` varchar(255),
	`bio` text,
	`userType` enum('distributor','customer') NOT NULL,
	`isPublished` boolean NOT NULL DEFAULT true,
	`pageViews` int NOT NULL DEFAULT 0,
	`signupsGenerated` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `user_profiles_customSlug_unique` UNIQUE(`customSlug`)
);
