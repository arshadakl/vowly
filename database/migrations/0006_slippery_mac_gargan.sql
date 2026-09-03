CREATE TABLE `invitation_template_customizations` (
	`invitation_id` text NOT NULL,
	`template_id` text NOT NULL,
	`version` integer DEFAULT 1 NOT NULL,
	`font_family` text DEFAULT 'cinzel' NOT NULL,
	`font_size` integer DEFAULT 14 NOT NULL,
	`show_events` integer DEFAULT true NOT NULL,
	`music_enabled` integer DEFAULT false NOT NULL,
	`text_json` text DEFAULT '{}' NOT NULL,
	`styles_json` text DEFAULT '{}' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	PRIMARY KEY(`invitation_id`, `template_id`),
	FOREIGN KEY (`invitation_id`) REFERENCES `invitations`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `idx_template_customizations_invitation` ON `invitation_template_customizations` (`invitation_id`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`client_id` text NOT NULL,
	`bride_name` text DEFAULT '' NOT NULL,
	`groom_name` text DEFAULT '' NOT NULL,
	`slug` text,
	`template` text,
	`bride_parents` text,
	`groom_parents` text,
	`cover_image` text,
	`bride_image` text,
	`groom_image` text,
	`show_images` integer DEFAULT false NOT NULL,
	`quote` text,
	`edit_override` text,
	`rsvp_enabled` integer DEFAULT false NOT NULL,
	`featured_venue_event_id` text,
	`couple_image_asset_id` text,
	`couple_image_public_id` text,
	`couple_image_version` integer,
	`couple_image_format` text,
	`couple_image_width` integer,
	`couple_image_height` integer,
	`published` integer DEFAULT false NOT NULL,
	`published_at` text,
	`og_image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_invitations`("id", "client_id", "bride_name", "groom_name", "slug", "template", "bride_parents", "groom_parents", "cover_image", "bride_image", "groom_image", "show_images", "quote", "edit_override", "rsvp_enabled", "featured_venue_event_id", "couple_image_asset_id", "couple_image_public_id", "couple_image_version", "couple_image_format", "couple_image_width", "couple_image_height", "published", "published_at", "og_image_url", "created_at", "updated_at") SELECT "id", "client_id", "bride_name", "groom_name", "slug", CASE WHEN "template" IN ('floral', 'olive-grove', 'burgundy') THEN NULL ELSE "template" END, NULL, NULL, "cover_image", "bride_image", "groom_image", "show_images", "quote", "edit_override", "rsvp_enabled", "featured_venue_event_id", NULL, NULL, NULL, NULL, NULL, NULL, CASE WHEN "template" IN ('floral', 'olive-grove', 'burgundy') THEN 0 ELSE "published" END, CASE WHEN "template" IN ('floral', 'olive-grove', 'burgundy') THEN NULL ELSE "published_at" END, CASE WHEN "template" IN ('floral', 'olive-grove', 'burgundy') THEN NULL ELSE "og_image_url" END, "created_at", "updated_at" FROM `invitations`;--> statement-breakpoint
DROP TABLE `invitations`;--> statement-breakpoint
ALTER TABLE `__new_invitations` RENAME TO `invitations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_client_id_unique` ON `invitations` (`client_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `invitations_slug_unique` ON `invitations` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_invitations_published` ON `invitations` (`published`);
