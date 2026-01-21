ALTER TABLE `distributors` MODIFY COLUMN `rank` enum('starter','bronze','silver','gold','platinum','diamond','crown','ambassador') NOT NULL DEFAULT 'starter';--> statement-breakpoint
ALTER TABLE `distributors` ADD `placementPosition` enum('left','right');--> statement-breakpoint
ALTER TABLE `distributors` ADD `username` varchar(50);--> statement-breakpoint
ALTER TABLE `distributors` ADD `subdomain` varchar(50);--> statement-breakpoint
ALTER TABLE `distributors` ADD `leftLegVolume` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `rightLegVolume` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `monthlyPV` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `monthlyAutoshipPV` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `activeDownlineCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `isActive` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `distributors` ADD `lastQualificationDate` timestamp;--> statement-breakpoint
ALTER TABLE `distributors` ADD `fastStartEligibleUntil` timestamp;--> statement-breakpoint
ALTER TABLE `distributors` ADD CONSTRAINT `distributors_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `distributors` ADD CONSTRAINT `distributors_subdomain_unique` UNIQUE(`subdomain`);