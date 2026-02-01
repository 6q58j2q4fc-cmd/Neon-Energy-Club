CREATE TABLE `mfa_recovery_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`email` varchar(320) NOT NULL,
	`recoveryToken` varchar(64) NOT NULL,
	`tokenExpiry` timestamp NOT NULL,
	`status` enum('pending','email_verified','approved','rejected','completed','expired') NOT NULL DEFAULT 'pending',
	`verificationAnswers` text,
	`adminNotes` text,
	`processedBy` int,
	`ipAddress` varchar(45),
	`userAgent` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mfa_recovery_requests_id` PRIMARY KEY(`id`),
	CONSTRAINT `mfa_recovery_requests_recoveryToken_unique` UNIQUE(`recoveryToken`)
);
