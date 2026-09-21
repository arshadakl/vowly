ALTER TABLE `clients` ADD COLUMN `share_token` text;
--> statement-breakpoint
UPDATE `clients` SET `share_token` = lower(hex(randomblob(16)));
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_share_token_unique` ON `clients` (`share_token`);
