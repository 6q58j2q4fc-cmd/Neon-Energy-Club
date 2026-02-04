CREATE TABLE `backup_schedules` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`backupType` enum('full','incremental') NOT NULL DEFAULT 'incremental',
	`tables` text,
	`cronExpression` varchar(100) NOT NULL,
	`retentionDays` int NOT NULL DEFAULT 30,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastRunAt` timestamp,
	`nextRunAt` timestamp,
	`lastRunStatus` enum('success','failed','never_run') DEFAULT 'never_run',
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `backup_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `backup_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backupId` int NOT NULL,
	`tableName` varchar(100) NOT NULL,
	`recordId` int NOT NULL,
	`recordData` text NOT NULL,
	`dataHash` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `backup_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `data_backups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`backupType` enum('full','incremental','table_specific','manual') NOT NULL DEFAULT 'manual',
	`tablesIncluded` text NOT NULL,
	`totalRecords` int NOT NULL DEFAULT 0,
	`backupFileUrl` varchar(500),
	`fileSizeBytes` int NOT NULL DEFAULT 0,
	`status` enum('in_progress','completed','failed','expired') NOT NULL DEFAULT 'in_progress',
	`errorMessage` text,
	`retentionDays` int NOT NULL DEFAULT 30,
	`expiresAt` timestamp,
	`createdBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `data_backups_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deleted_records_archive` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tableName` varchar(100) NOT NULL,
	`originalId` int NOT NULL,
	`recordData` text NOT NULL,
	`deletionReason` varchar(255),
	`deletedBy` int,
	`canRestore` boolean NOT NULL DEFAULT true,
	`restoreDeadline` timestamp,
	`wasRestored` boolean NOT NULL DEFAULT false,
	`restoredAt` timestamp,
	`restoredBy` int,
	`deletedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `deleted_records_archive_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `restoration_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`backupId` int NOT NULL,
	`restorationType` enum('full','partial','single_record') NOT NULL,
	`tablesRestored` text,
	`recordsRestored` int NOT NULL DEFAULT 0,
	`status` enum('in_progress','completed','failed','rolled_back') NOT NULL DEFAULT 'in_progress',
	`errorMessage` text,
	`performedBy` int NOT NULL,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `restoration_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_audit_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`category` enum('user','distributor','order','commission','website','backup','restore','admin','security','system') NOT NULL,
	`action` varchar(100) NOT NULL,
	`entityType` varchar(50) NOT NULL,
	`entityId` int,
	`userId` int,
	`userRole` varchar(50),
	`ipAddress` varchar(45),
	`userAgent` varchar(500),
	`previousState` text,
	`newState` text,
	`metadata` text,
	`result` enum('success','failure','partial') NOT NULL DEFAULT 'success',
	`errorMessage` text,
	`severity` enum('info','warning','error','critical') NOT NULL DEFAULT 'info',
	`isReversible` boolean NOT NULL DEFAULT false,
	`relatedEntries` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_audit_log_id` PRIMARY KEY(`id`)
);
