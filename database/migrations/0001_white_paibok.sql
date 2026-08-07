DROP INDEX IF EXISTS `idx_invitations_slug`;--> statement-breakpoint
UPDATE clients
SET phone = replace(replace(replace(replace(phone, ' ', ''), '-', ''), '(', ''), ')', '')
WHERE phone != replace(replace(replace(replace(phone, ' ', ''), '-', ''), '(', ''), ')', '');
