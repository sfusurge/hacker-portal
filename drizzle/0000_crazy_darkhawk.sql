CREATE TYPE "public"."level_study" AS ENUM('High School', 'Undergraduate University (2 years)', 'Usergraduate University (3+ years)', 'Graduate University', 'Code School / Bootcamp', 'Trade Program / Apprenticeship', 'Post Doctorate', 'Other', 'Not a student', 'N/A');--> statement-breakpoint
CREATE TABLE "applications" (
	"hackathon_id" integer NOT NULL,
	"user_id" uuid NOT NULL,
	"response" json NOT NULL,
	"created_date" varchar(255) NOT NULL,
	"updated_date" varchar(255) NOT NULL,
	CONSTRAINT "applications_hackathon_id_user_id_pk" PRIMARY KEY("hackathon_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hackathons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"start_date" varchar(255) NOT NULL,
	"end_date" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_personal_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "user_personal_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" uuid,
	"hackathon_id" integer,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"age" integer NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"email" varchar(150) NOT NULL,
	"school" varchar(100) NOT NULL,
	"level_study" "level_study" DEFAULT 'N/A',
	"country" integer NOT NULL,
	"socials" json,
	"agree_to_mlh_ads" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(64) NOT NULL,
	"last_name" varchar(64) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_personal_data" ADD CONSTRAINT "user_personal_data_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_personal_data" ADD CONSTRAINT "user_personal_data_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;