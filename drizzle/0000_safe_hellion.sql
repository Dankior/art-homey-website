CREATE TABLE `requests` (
	`id` text PRIMARY KEY NOT NULL,
	`category` text NOT NULL,
	`budget` text NOT NULL,
	`name` text DEFAULT '' NOT NULL,
	`contact` text NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`consent_version` text NOT NULL,
	`created_at` text NOT NULL
);
