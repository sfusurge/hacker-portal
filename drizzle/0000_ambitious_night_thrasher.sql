DO $$ BEGIN
 CREATE TYPE "public"."levelStudy" AS ENUM('High School', 'Undergraduate University (2 years)', 'Usergraduate University (3+ years)', 'Graduate University', 'Code School / Bootcamp', 'Trade Program / APprenticeship', 'Post Doctorate', 'Other', 'Not a student', 'N/A');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hackathons" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"start_date" varchar(255) NOT NULL,
	"end_date" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "userPersonalData" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"hackathon_id" integer,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"age" integer NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(150) NOT NULL,
	"school" varchar(100) NOT NULL,
	"level_study" "levelStudy" DEFAULT 'N/A',
	"country" integer NOT NULL,
	"socials" json,
	"agree_to_mlh_ads" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userPersonalData" ADD CONSTRAINT "userPersonalData_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "userPersonalData" ADD CONSTRAINT "userPersonalData_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
