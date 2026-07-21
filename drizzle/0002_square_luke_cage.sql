CREATE TABLE "sh_26_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sh_26_emails_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "flagged" boolean DEFAULT false NOT NULL;