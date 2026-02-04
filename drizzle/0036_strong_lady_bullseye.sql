ALTER TABLE `users` ADD `username` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('customer','distributor','franchisee','admin') DEFAULT 'customer' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetToken` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordResetExpiry` timestamp;