CREATE TABLE `hackathons` (
	`hackathon_id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`start_date` varchar(255) NOT NULL,
	`end_date` varchar(255) NOT NULL,
	CONSTRAINT `hackathons_hackathon_id` PRIMARY KEY(`hackathon_id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(97) NOT NULL;