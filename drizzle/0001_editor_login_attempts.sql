CREATE TABLE `editor_login_attempts` (
	`key` text PRIMARY KEY NOT NULL,
	`failures` integer NOT NULL,
	`window_start` integer NOT NULL
);
