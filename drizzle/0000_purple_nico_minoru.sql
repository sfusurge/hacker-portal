CREATE TABLE IF NOT EXISTS "hackathons" (
	"hackathon_id" varchar(128) PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" varchar(255) NOT NULL,
	"end_date" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" varchar(128) PRIMARY KEY NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(97) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
