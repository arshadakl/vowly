ALTER TABLE `clients` ADD COLUMN `login_link_token_hash` text;
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_login_link_token_hash_unique` ON `clients` (`login_link_token_hash`);
--> statement-breakpoint
CREATE TABLE `rate_limit_buckets` (
  `bucket_key` text PRIMARY KEY NOT NULL,
  `count` integer NOT NULL,
  `reset_at` text NOT NULL,
  `updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_rate_limit_buckets_reset_at` ON `rate_limit_buckets` (`reset_at`);
