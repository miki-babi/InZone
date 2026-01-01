CREATE TABLE `voice_journal_table` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`file_path` text NOT NULL,
	`category` text NOT NULL,
	`recorded_at` integer
);
