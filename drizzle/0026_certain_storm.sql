ALTER TABLE `users` ADD `phoneVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `smsVerificationCode` varchar(6);--> statement-breakpoint
ALTER TABLE `users` ADD `smsVerificationExpiry` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `smsVerificationAttempts` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `lastSmsSentAt` timestamp;