CREATE TYPE "public"."application_status" AS ENUM('N/A', 'Awaiting Review', 'Accepted', 'Declined', 'Wait List', 'Withdrawn');--> statement-breakpoint
CREATE TYPE "public"."oauth_provider" AS ENUM('github', 'google', 'n/a');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TABLE "applications" (
	"hackathon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"currentStatus" "application_status" DEFAULT 'Awaiting Review' NOT NULL,
	"pendingStatus" "application_status" DEFAULT 'N/A' NOT NULL,
	"response" json NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "applications_hackathon_id_user_id_pk" PRIMARY KEY("hackathon_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"check_in_time" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_ins_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "events_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hackathon_id" integer NOT NULL,
	"title" varchar(1024) NOT NULL,
	"color" varchar(128) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"location" varchar(1024) NOT NULL,
	"description" varchar(2048) DEFAULT '',
	"long_description" text
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hackathons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"start_date" varchar(255) NOT NULL,
	"end_date" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "team_display_id" (
	"display_id" varchar(6) PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	CONSTRAINT "team_display_id_team_id_unique" UNIQUE("team_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hackathon_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"team_picture_url" text,
	"max_members_count" integer DEFAULT 4 NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_display_id" (
	"display_id" varchar(6) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "user_display_id_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_oauth" (
	"user_id" integer NOT NULL,
	"provider" "oauth_provider" DEFAULT 'n/a' NOT NULL,
	CONSTRAINT "user_oauth_user_id_provider_pk" PRIMARY KEY("user_id","provider")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(64),
	"last_name" varchar(64),
	"phone_number" varchar(15),
	"email" varchar(255) NOT NULL,
	"user_role" "user_role" DEFAULT 'user' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_display_id" ADD CONSTRAINT "team_display_id_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_display_id" ADD CONSTRAINT "user_display_id_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_oauth" ADD CONSTRAINT "user_oauth_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "check_ins_user_id_index" ON "check_ins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_hackathon_id_index" ON "events" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "memberships_user_id_index" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teams_hackathon_id_index" ON "teams" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "email_index" ON "users" USING btree ("email");