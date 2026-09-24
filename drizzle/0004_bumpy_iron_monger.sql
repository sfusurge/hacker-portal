ALTER TABLE "events" ALTER COLUMN "location" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "image_url" text;