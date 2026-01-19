ALTER TABLE `preorders` ADD `trackingNumber` varchar(100);--> statement-breakpoint
ALTER TABLE `preorders` ADD `carrier` varchar(50);--> statement-breakpoint
ALTER TABLE `preorders` ADD `estimatedDelivery` timestamp;