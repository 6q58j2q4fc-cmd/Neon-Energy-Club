ALTER TABLE `distributors` ADD `phone` varchar(50);--> statement-breakpoint
ALTER TABLE `distributors` ADD `address` text;--> statement-breakpoint
ALTER TABLE `distributors` ADD `city` varchar(100);--> statement-breakpoint
ALTER TABLE `distributors` ADD `state` varchar(100);--> statement-breakpoint
ALTER TABLE `distributors` ADD `zipCode` varchar(20);--> statement-breakpoint
ALTER TABLE `distributors` ADD `dateOfBirth` varchar(20);--> statement-breakpoint
ALTER TABLE `distributors` ADD `taxIdLast4` varchar(4);--> statement-breakpoint
ALTER TABLE `distributors` ADD `agreedToPoliciesAt` timestamp;--> statement-breakpoint
ALTER TABLE `distributors` ADD `agreedToTermsAt` timestamp;