CREATE TYPE "public"."announcement_source" AS ENUM('discord');--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('N/A', 'Awaiting Review', 'Accepted', 'Declined', 'Wait List', 'Withdrawn', 'Accepted - Pending Payment', 'Accepted - RSVP to Confirm');--> statement-breakpoint
CREATE TYPE "public"."company_role" AS ENUM('mentor', 'sponsor');--> statement-breakpoint
CREATE TYPE "public"."sponsor_tier" AS ENUM('plat', 'gold', 'title');--> statement-breakpoint
CREATE TYPE "public"."hackathon_email_type" AS ENUM('hacker_applied', 'rsvp_received', 'rsvp_paid', 'hacker_declined', 'hacker_accepted', 'hacker_waitlisted', 'custom');--> statement-breakpoint
CREATE TYPE "public"."event_type_enum" AS ENUM('Event', 'Meal', 'Workshop');--> statement-breakpoint
CREATE TYPE "public"."judging_status" AS ENUM('unjudged', 'judged');--> statement-breakpoint
CREATE TYPE "public"."submission_status" AS ENUM('Awaiting Review', 'Reviewed');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'judge', 'sponsor');--> statement-breakpoint
CREATE TABLE "announcement_attachments" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "announcement_attachments_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"announcement_id" integer NOT NULL,
	"source_url" text NOT NULL,
	"stored_url" text,
	"storage_provider" varchar(32),
	"storage_key" text,
	"uploaded_at" timestamp with time zone,
	"filename" varchar(256),
	"content_type" varchar(128),
	"size_bytes" integer,
	"width" integer,
	"height" integer,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcement_channel_mappings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "announcement_channel_mappings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"discord_channel_id" varchar(64) NOT NULL,
	"discord_guild_id" varchar(64) NOT NULL,
	"hackathon_id" integer NOT NULL,
	"label" varchar(256),
	"event_location_key" varchar(32),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "announcements" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "announcements_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hackathon_id" integer NOT NULL,
	"source" "announcement_source" DEFAULT 'discord' NOT NULL,
	"source_message_id" varchar(64) NOT NULL,
	"source_channel_id" varchar(64) NOT NULL,
	"source_guild_id" varchar(64) NOT NULL,
	"source_author_id" varchar(64) NOT NULL,
	"idempotency_key" varchar(128) NOT NULL,
	"content" text NOT NULL,
	"raw_payload" jsonb DEFAULT 'null'::jsonb,
	"mention_metadata" jsonb DEFAULT 'null'::jsonb,
	"source_timestamp" timestamp with time zone NOT NULL,
	"last_edited_at" timestamp with time zone,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"hackathon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"current_status" "application_status" DEFAULT 'Awaiting Review' NOT NULL,
	"pending_status" "application_status" DEFAULT 'N/A' NOT NULL,
	"response" json NOT NULL,
	"created_date" timestamp DEFAULT now() NOT NULL,
	"last_email_sent" text DEFAULT 'N/A' NOT NULL,
	CONSTRAINT "applications_hackathon_id_user_id_pk" PRIMARY KEY("hackathon_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"accountId" text NOT NULL,
	"providerId" text NOT NULL,
	"accessToken" text,
	"refreshToken" text,
	"accessTokenExpiresAt" timestamp,
	"refreshTokenExpiresAt" timestamp,
	"scope" text,
	"idToken" text,
	"password" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" integer NOT NULL,
	"token" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"ipAddress" text,
	"userAgent" text,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"createdAt" timestamp NOT NULL,
	"updatedAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "check_ins" (
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"check_in_time" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "check_ins_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "company" (
	"hackathon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"role" "company_role" NOT NULL,
	"sponsor_tier" "sponsor_tier",
	"company_title" json,
	"skills" json,
	"created_date" timestamp DEFAULT now() NOT NULL,
	"updated_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_hackathon_id_user_id_pk" PRIMARY KEY("hackathon_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "email_queue" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_queue_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"user_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"email" varchar(256) NOT NULL,
	"first_name" varchar(256),
	"last_name" varchar(256),
	"hackathon_id" integer,
	"email_type" varchar(256),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"error_message" text,
	"failed_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sent_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "email_template_styling" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_template_styling_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(256) NOT NULL,
	"html" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "email_templates" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "email_templates_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" varchar(256) NOT NULL,
	"purpose" varchar(256) NOT NULL,
	"description" text,
	"styling_id" integer,
	"content" text NOT NULL,
	"hackathon_id" integer NOT NULL,
	"email_type" "hackathon_email_type",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sh_25_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(256) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sh_25_emails_email_unique" UNIQUE("email")
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
	"long_description" text,
	"event_type" "event_type_enum" DEFAULT 'Event' NOT NULL,
	"has_check_in" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hackathons" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "hackathons_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"start_date" varchar(255) NOT NULL,
	"end_date" varchar(255) NOT NULL,
	"submission_deadline" timestamp DEFAULT '2025-02-14 07:59:59.000' NOT NULL,
	"project_gallery_open" timestamp with time zone,
	"submission_open" timestamp with time zone,
	"questions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_visible" boolean DEFAULT false NOT NULL,
	"is_multiple_locations" boolean DEFAULT false NOT NULL,
	"submissionQuestions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"judgeQuestions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"judgeRubric" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_paid" boolean DEFAULT false NOT NULL,
	"payment_deadline" timestamp with time zone,
	"application_open" timestamp with time zone,
	"application_closes" timestamp with time zone,
	"audience_voting_enabled" boolean DEFAULT false NOT NULL,
	"audience_voting_open" timestamp with time zone,
	"audience_voting_closes" timestamp with time zone,
	"event_page_slug" varchar(255) DEFAULT 'stormhacks' NOT NULL,
	"event_page_payload" jsonb DEFAULT 'null'::jsonb
);
--> statement-breakpoint
CREATE TABLE "judging_assignments" (
	"hackathon_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" "judging_status" DEFAULT 'unjudged' NOT NULL,
	"response" json,
	"created_date" timestamp DEFAULT now() NOT NULL,
	"updated_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "judging_assignments_hackathon_id_team_id_user_id_pk" PRIMARY KEY("hackathon_id","team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "memberships_team_id_user_id_pk" PRIMARY KEY("team_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "project_attachments" (
	"team_id" integer NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"download_url" text NOT NULL,
	"created_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_attachments_team_id_name_pk" PRIMARY KEY("team_id","name")
);
--> statement-breakpoint
CREATE TABLE "submissions" (
	"team_id" integer PRIMARY KEY NOT NULL,
	"hackathon_id" integer NOT NULL,
	"current_status" "submission_status" DEFAULT 'Awaiting Review' NOT NULL,
	"response" json NOT NULL,
	"created_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "teams_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hackathon_id" integer NOT NULL,
	"name" varchar(256) NOT NULL,
	"team_picture_url" text,
	"max_members_count" integer DEFAULT 4 NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"display_id" varchar(6) NOT NULL,
	CONSTRAINT "teams_display_id_unique" UNIQUE("display_id")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" integer PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "user_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text,
	"first_name" varchar(64),
	"last_name" varchar(64),
	"phone_number" varchar(15),
	"email" varchar(255) NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"user_role" "user_role" DEFAULT 'user' NOT NULL,
	"display_id" varchar(6) NOT NULL,
	"last_seen_announcements_at" timestamp with time zone,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email"),
	CONSTRAINT "user_display_id_unique" UNIQUE("display_id")
);
--> statement-breakpoint
CREATE TABLE "user_votes" (
	"hackathon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"created_date" timestamp DEFAULT now() NOT NULL,
	"updated_date" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_votes_hackathon_id_user_id_pk" PRIMARY KEY("hackathon_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "announcement_attachments" ADD CONSTRAINT "announcement_attachments_announcement_id_announcements_id_fk" FOREIGN KEY ("announcement_id") REFERENCES "public"."announcements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcement_channel_mappings" ADD CONSTRAINT "announcement_channel_mappings_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "announcements" ADD CONSTRAINT "announcements_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "check_ins" ADD CONSTRAINT "check_ins_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company" ADD CONSTRAINT "company_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_styling_id_email_template_styling_id_fk" FOREIGN KEY ("styling_id") REFERENCES "public"."email_template_styling"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "email_templates" ADD CONSTRAINT "email_templates_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judging_assignments" ADD CONSTRAINT "judging_assignments_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judging_assignments" ADD CONSTRAINT "judging_assignments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "judging_assignments" ADD CONSTRAINT "judging_assignments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_attachments" ADD CONSTRAINT "project_attachments_team_id_user_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "submissions" ADD CONSTRAINT "submissions_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_votes" ADD CONSTRAINT "user_votes_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "announcement_attachments_announcement_id_index" ON "announcement_attachments" USING btree ("announcement_id");--> statement-breakpoint
CREATE UNIQUE INDEX "announcement_channel_mappings_channel_unique" ON "announcement_channel_mappings" USING btree ("discord_channel_id");--> statement-breakpoint
CREATE INDEX "announcement_channel_mappings_hackathon_id_index" ON "announcement_channel_mappings" USING btree ("hackathon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "announcements_source_message_unique" ON "announcements" USING btree ("source","source_message_id");--> statement-breakpoint
CREATE UNIQUE INDEX "announcements_idempotency_key_unique" ON "announcements" USING btree ("idempotency_key");--> statement-breakpoint
CREATE INDEX "announcements_hackathon_id_created_at_index" ON "announcements" USING btree ("hackathon_id","created_at");--> statement-breakpoint
CREATE INDEX "announcements_source_channel_id_index" ON "announcements" USING btree ("source_channel_id");--> statement-breakpoint
CREATE INDEX "check_ins_user_id_index" ON "check_ins" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "events_hackathon_id_index" ON "events" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "memberships_user_id_index" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "teams_hackathon_id_index" ON "teams" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "teams_display_id_index" ON "teams" USING btree ("display_id");--> statement-breakpoint
CREATE INDEX "email_index" ON "user" USING btree ("email");--> statement-breakpoint
CREATE INDEX "display_id_index" ON "user" USING btree ("display_id");