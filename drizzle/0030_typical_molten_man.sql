ALTER TABLE `preorders` ADD `nftId` varchar(50);--> statement-breakpoint
ALTER TABLE `preorders` ADD `nftImageUrl` text;--> statement-breakpoint
ALTER TABLE `preorders` ADD `nftMintStatus` enum('pending','ready','minted') DEFAULT 'pending';