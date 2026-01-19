CREATE TABLE `investor_inquiries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(50),
	`company` varchar(255),
	`investmentRange` enum('under_10k','10k_50k','50k_100k','100k_500k','500k_1m','over_1m') NOT NULL,
	`accreditedStatus` enum('yes','no','unsure') NOT NULL,
	`investmentType` enum('equity','convertible_note','revenue_share','franchise','other') NOT NULL,
	`referralSource` varchar(255),
	`message` text,
	`status` enum('new','contacted','in_discussion','committed','declined') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `investor_inquiries_id` PRIMARY KEY(`id`)
);
