CREATE TABLE `maintenance_requests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`requesterId` int NOT NULL,
	`requestType` enum('repair','restock','cleaning','inspection','relocation','upgrade') NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`title` varchar(200) NOT NULL,
	`description` text,
	`photos` text,
	`status` enum('pending','assigned','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
	`assignedTo` int,
	`scheduledDate` timestamp,
	`completedAt` timestamp,
	`serviceNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `maintenance_requests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mfa_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totpSecret` varchar(255) NOT NULL,
	`isEnabled` boolean NOT NULL DEFAULT false,
	`backupCodes` text,
	`backupCodesRemaining` int NOT NULL DEFAULT 10,
	`lastVerifiedAt` timestamp,
	`failedAttempts` int NOT NULL DEFAULT 0,
	`lockedUntil` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mfa_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `mfa_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `vending_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`alertType` enum('low_stock','temperature','offline','door_open','payment_error','maintenance_due','error') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL DEFAULT 'info',
	`title` varchar(200) NOT NULL,
	`message` text,
	`acknowledged` boolean NOT NULL DEFAULT false,
	`acknowledgedBy` int,
	`acknowledgedAt` timestamp,
	`resolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vending_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vending_inventory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`slotNumber` int NOT NULL,
	`productName` varchar(100) NOT NULL,
	`productSku` varchar(50) NOT NULL,
	`currentStock` int NOT NULL DEFAULT 0,
	`maxCapacity` int NOT NULL DEFAULT 10,
	`lowStockThreshold` int NOT NULL DEFAULT 3,
	`priceInCents` int NOT NULL,
	`lastRestockedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vending_inventory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vending_machines` (
	`id` int AUTO_INCREMENT NOT NULL,
	`serialNumber` varchar(50) NOT NULL,
	`nickname` varchar(100),
	`ownerId` int NOT NULL,
	`territoryLicenseId` int,
	`model` varchar(100) NOT NULL DEFAULT 'NEON-VM-2000',
	`locationAddress` text,
	`locationLat` decimal(10,7),
	`locationLng` decimal(10,7),
	`locationType` enum('mall','gym','office','school','hospital','airport','hotel','gas_station','other') NOT NULL DEFAULT 'other',
	`status` enum('online','offline','maintenance','error') NOT NULL DEFAULT 'offline',
	`lastHeartbeat` timestamp,
	`temperature` decimal(5,2),
	`temperatureStatus` enum('normal','warning','critical') NOT NULL DEFAULT 'normal',
	`doorStatus` enum('closed','open','jammed') NOT NULL DEFAULT 'closed',
	`paymentStatus` enum('operational','card_only','cash_only','offline') NOT NULL DEFAULT 'operational',
	`totalSalesCount` int NOT NULL DEFAULT 0,
	`totalRevenue` int NOT NULL DEFAULT 0,
	`todaySalesCount` int NOT NULL DEFAULT 0,
	`todayRevenue` int NOT NULL DEFAULT 0,
	`installedAt` timestamp,
	`lastMaintenanceAt` timestamp,
	`nextMaintenanceAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vending_machines_id` PRIMARY KEY(`id`),
	CONSTRAINT `vending_machines_serialNumber_unique` UNIQUE(`serialNumber`)
);
--> statement-breakpoint
CREATE TABLE `vending_sales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`machineId` int NOT NULL,
	`slotNumber` int NOT NULL,
	`productName` varchar(100) NOT NULL,
	`productSku` varchar(50) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`amountInCents` int NOT NULL,
	`paymentMethod` enum('card','cash','mobile','free') NOT NULL DEFAULT 'card',
	`transactionRef` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vending_sales_id` PRIMARY KEY(`id`)
);
