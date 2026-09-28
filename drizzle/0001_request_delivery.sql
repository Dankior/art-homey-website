ALTER TABLE `requests` ADD `submission_key` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `payload_hash` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `notified_at` text;--> statement-breakpoint
ALTER TABLE `requests` ADD `notification_attempts` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `notification_next_at` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `requests` ADD `notification_locked_until` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `requests_submission_key` ON `requests` (`submission_key`);--> statement-breakpoint
CREATE INDEX `requests_contact_created` ON `requests` (`contact`,`created_at`);--> statement-breakpoint
CREATE INDEX `requests_pending_notification` ON `requests` (`notification_next_at`,`created_at`) WHERE "requests"."notified_at" IS NULL;--> statement-breakpoint
-- Historical leads must be reviewed manually, not broadcast on first deployment.
UPDATE requests SET notified_at = 'legacy-manual-review' WHERE submission_key IS NULL;
