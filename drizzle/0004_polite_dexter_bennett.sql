CREATE TABLE `autoShipSubscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`packageId` int NOT NULL,
	`status` enum('active','paused','cancelled') NOT NULL DEFAULT 'active',
	`frequency` enum('weekly','biweekly','monthly') NOT NULL DEFAULT 'monthly',
	`nextShipDate` timestamp NOT NULL,
	`lastShipDate` timestamp,
	`shippingAddress` text NOT NULL,
	`stripeSubscriptionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `autoShipSubscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`distributorId` int,
	`packageId` int NOT NULL,
	`orderNumber` varchar(50) NOT NULL,
	`customerName` varchar(255) NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`shippingAddress` text NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`pv` int NOT NULL,
	`status` enum('pending','paid','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
	`stripePaymentId` varchar(255),
	`isAutoShip` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `packages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('distributor','customer') NOT NULL,
	`tier` enum('starter','pro','elite','single','12pack','24pack') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`pv` int NOT NULL,
	`description` text,
	`contents` text,
	`active` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `packages_id` PRIMARY KEY(`id`)
);
