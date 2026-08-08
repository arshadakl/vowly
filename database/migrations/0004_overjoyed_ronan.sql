PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`bride_name` text DEFAULT '' NOT NULL,
	`groom_name` text DEFAULT '' NOT NULL,
	`slug` text,
	`template` text DEFAULT 'floral' NOT NULL,
	`cover_image` text,
	`bride_image` text,
	`groom_image` text,
	`show_images` integer DEFAULT false NOT NULL,
	`quote` text,
	`edit_override` text,
	`rsvp_enabled` integer DEFAULT false NOT NULL,
	`featured_venue_event_id` text,
	`published` integer DEFAULT false NOT NULL,
	`published_at` text,
	`og_image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invitations`("id", "client_id", "bride_name", "groom_name", "slug", "template", "cover_image", "bride_image", "groom_image", "show_images", "quote", "edit_override", "rsvp_enabled", "featured_venue_event_id", "published", "published_at", "og_image_url", "created_at", "updated_at") SELECT "id", "client_id", "bride_name", "groom_name", "slug", "template", "cover_image", "bride_image", "groom_image", "show_images", "quote", "edit_override", "rsvp_enabled", "featured_venue_event_id", "published", "published_at", "og_image_url", "created_at", "updated_at" FROM `invitations`;--> statement-breakpoint
DROP TABLE `invitations`;--> statement-breakpoint
ALTER TABLE `__new_invitations` RENAME TO `invitations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_client_id_unique` ON `invitations` (`client_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_invitations_published` ON `invitations` (`published`);--> statement-breakpoint
ALTER TABLE `events` ADD `google_map_embed` text;