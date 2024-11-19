CREATE TABLE IF NOT EXISTS "mostRecentComment" (
	"id" serial PRIMARY KEY NOT NULL,
	"userName" varchar DEFAULT '' NOT NULL,
	"message" text DEFAULT '' NOT NULL
);
