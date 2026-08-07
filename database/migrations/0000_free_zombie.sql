CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_username_unique` ON `admins` (`username`);--> statement-breakpoint
CREATE TABLE `clients` (
	`id` text PRIMARY KEY NOT NULL,
	`client_code` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`passcode` text NOT NULL,
	`status` text DEFAULT 'ACTIVE' NOT NULL,
	`wedding_date` text NOT NULL,
	`wedding_tz` text DEFAULT 'Asia/Kolkata' NOT NULL,
`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clients_client_code_unique` ON `clients` (`client_code`);--> statement-breakpoint
CREATE UNIQUE INDEX `clients_passcode_unique` ON `clients` (`passcode`);--> statement-breakpoint
CREATE INDEX `idx_clients_status` ON `clients` (`status`);--> statement-breakpoint
CREATE INDEX `idx_clients_wedding_date` ON `clients` (`wedding_date`);--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`title` text NOT NULL,
	`event_date` text NOT NULL,
	`start_time` text,
	`end_time` text,
	`venue` text,
	`google_map` text,
	`address` text,
	`notes` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_events_invitation_id` ON `events` (`invitation_id`);--> statement-breakpoint
CREATE TABLE `invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`bride_name` text DEFAULT '' NOT NULL,
	`groom_name` text DEFAULT '' NOT NULL,
	`slug` text,
	`template` text DEFAULT 'classic' NOT NULL,
	`cover_image` text,
	`bride_image` text,
	`groom_image` text,
	`quote` text,
	`edit_override` text,
	`rsvp_enabled` integer DEFAULT false NOT NULL,
	`published` integer DEFAULT false NOT NULL,
	`published_at` text,
	`og_image_url` text,
`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_client_id_unique` ON `invitations` (`client_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_invitations_published` ON `invitations` (`published`);--> statement-breakpoint
CREATE TABLE `rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`invitation_id` text NOT NULL,
	`guest_name` text NOT NULL,
	`status` text NOT NULL,
	`guest_count` integer DEFAULT 1 NOT NULL,
`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_rsvps_invitation_id` ON `rsvps` (`invitation_id`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`subject_type` text NOT NULL,
	`subject_id` text NOT NULL,
	`token_hash` text NOT NULL,
 `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`expires_at` text NOT NULL,
	`last_seen_at` text,
	`ip` text,
	`user_agent` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_hash_unique` ON `sessions` (`token_hash`);--> statement-breakpoint
CREATE INDEX `idx_sessions_subject_id` ON `sessions` (`subject_id`);--> statement-breakpoint
CREATE INDEX `idx_sessions_expires_at` ON `sessions` (`expires_at`);
