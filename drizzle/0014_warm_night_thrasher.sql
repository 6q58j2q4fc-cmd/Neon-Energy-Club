CREATE TABLE `autoship_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`autoshipId` int NOT NULL,
	`productSku` varchar(100) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`pvPerUnit` int NOT NULL DEFAULT 0,
	`pricePerUnit` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autoship_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `autoship_orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`autoshipId` int NOT NULL,
	`distributorId` int NOT NULL,
	`status` enum('pending','processing','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`totalPV` int NOT NULL DEFAULT 0,
	`totalAmount` int NOT NULL DEFAULT 0,
	`stripePaymentIntentId` varchar(255),
	`trackingNumber` varchar(100),
	`carrier` varchar(50),
	`failureReason` text,
	`processedAt` timestamp,
	`shippedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `autoship_orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `distributor_autoships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) DEFAULT 'Monthly Autoship',
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`processDay` int NOT NULL DEFAULT 1,
	`totalPV` int NOT NULL DEFAULT 0,
	`totalPrice` int NOT NULL DEFAULT 0,
	`paymentMethodId` varchar(255),
	`stripeCustomerId` varchar(255),
	`shippingAddress1` text,
	`shippingAddress2` text,
	`shippingCity` varchar(100),
	`shippingState` varchar(100),
	`shippingPostalCode` varchar(20),
	`shippingCountry` varchar(100) DEFAULT 'USA',
	`nextProcessDate` timestamp,
	`lastProcessedDate` timestamp,
	`successfulOrders` int DEFAULT 0,
	`failedAttempts` int DEFAULT 0,
	`lastFailureReason` text,
	`reminderSent` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `distributor_autoships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payout_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`payoutRequestId` int NOT NULL,
	`distributorId` int NOT NULL,
	`amount` int NOT NULL,
	`payoutMethod` varchar(50) NOT NULL,
	`transactionRef` varchar(255),
	`periodStart` timestamp,
	`periodEnd` timestamp,
	`commissionsIncluded` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payout_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payout_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int NOT NULL,
	`amount` int NOT NULL,
	`processingFee` int DEFAULT 0,
	`netAmount` int NOT NULL,
	`payoutMethod` enum('stripe_connect','paypal','bank_transfer','check') NOT NULL,
	`status` enum('pending','approved','processing','completed','failed','cancelled') NOT NULL DEFAULT 'pending',
	`stripeTransferId` varchar(255),
	`paypalPayoutId` varchar(255),
	`checkNumber` varchar(50),
	`approvedBy` int,
	`approvedAt` timestamp,
	`processedAt` timestamp,
	`completedAt` timestamp,
	`failureReason` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payout_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payout_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`distributorId` int NOT NULL,
	`payoutMethod` enum('stripe_connect','paypal','bank_transfer','check') NOT NULL DEFAULT 'stripe_connect',
	`stripeConnectAccountId` varchar(255),
	`stripeConnectStatus` enum('pending','onboarding','active','restricted','disabled') DEFAULT 'pending',
	`paypalEmail` varchar(320),
	`bankAccountName` varchar(255),
	`bankRoutingNumber` varchar(255),
	`bankAccountLast4` varchar(4),
	`bankAccountType` enum('checking','savings') DEFAULT 'checking',
	`checkMailingAddress` text,
	`minimumPayout` int NOT NULL DEFAULT 5000,
	`payoutFrequency` enum('weekly','biweekly','monthly') NOT NULL DEFAULT 'weekly',
	`taxFormSubmitted` int DEFAULT 0,
	`taxIdLast4` varchar(4),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payout_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `payout_settings_distributorId_unique` UNIQUE(`distributorId`)
);
