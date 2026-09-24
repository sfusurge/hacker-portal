ALTER TABLE "hackathons" ADD COLUMN "hacking_start" timestamp;
--> statement-breakpoint
UPDATE "hackathons"
SET "hacking_start" = COALESCE("submission_open"::timestamp, "submission_deadline")
WHERE "hacking_start" IS NULL;
--> statement-breakpoint
ALTER TABLE "hackathons" ALTER COLUMN "hacking_start" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "events" DROP COLUMN IF EXISTS "is_deadline";
