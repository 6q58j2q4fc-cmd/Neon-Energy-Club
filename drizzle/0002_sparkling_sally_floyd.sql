CREATE TABLE `crowdfunding` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`amount` int NOT NULL,
	`rewardTier` varchar(100),
	`status` enum('pending','completed','refunded') NOT NULL DEFAULT 'pending',
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `crowdfunding_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `territory_licenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`territory` text NOT NULL,
	`coordinates` text,
	`squareMiles` int NOT NULL,
	`termMonths` int NOT NULL,
	`pricePerSqMile` int NOT NULL,
	`totalCost` int NOT NULL,
	`depositAmount` int,
	`financing` enum('full','deposit','monthly') NOT NULL DEFAULT 'full',
	`status` enum('pending','approved','rejected','active') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `territory_licenses_id` PRIMARY KEY(`id`)
);
