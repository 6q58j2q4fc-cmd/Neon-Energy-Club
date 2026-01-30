CREATE TABLE `email_digest_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`notificationType` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`relatedId` int,
	`processed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_digest_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`referrals` boolean NOT NULL DEFAULT true,
	`commissions` boolean NOT NULL DEFAULT true,
	`teamUpdates` boolean NOT NULL DEFAULT true,
	`promotions` boolean NOT NULL DEFAULT true,
	`orders` boolean NOT NULL DEFAULT true,
	`announcements` boolean NOT NULL DEFAULT true,
	`digestFrequency` enum('none','daily','weekly') NOT NULL DEFAULT 'none',
	`digestDay` int DEFAULT 1,
	`digestHour` int DEFAULT 9,
	`lastDigestSent` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
