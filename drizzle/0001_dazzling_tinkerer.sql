ALTER TABLE "hackathons" ADD COLUMN "audience_voting_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "audience_voting_open" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hackathons" ADD COLUMN "audience_voting_closes" timestamp with time zone;