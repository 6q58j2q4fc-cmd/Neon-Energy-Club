CREATE TABLE `territory_reservations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`territoryName` varchar(255) NOT NULL,
	`state` varchar(2) NOT NULL,
	`centerLat` decimal(10,7) NOT NULL,
	`centerLng` decimal(10,7) NOT NULL,
	`radiusMiles` decimal(10,2) NOT NULL,
	`areaSqMiles` decimal(10,2) NOT NULL,
	`population` int NOT NULL,
	`licenseFee` int NOT NULL,
	`status` enum('active','expired','converted','cancelled') NOT NULL DEFAULT 'active',
	`expiresAt` timestamp NOT NULL,
	`reminderSent` boolean NOT NULL DEFAULT false,
	`convertedToLicenseId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `territory_reservations_id` PRIMARY KEY(`id`)
);
