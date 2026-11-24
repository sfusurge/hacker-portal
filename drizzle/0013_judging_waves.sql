CREATE TYPE "public"."judging_wave_status" AS ENUM('scheduled', 'active', 'done');
--> statement-breakpoint
CREATE TYPE "public"."judging_kind" AS ENUM('software', 'hardware');
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "judging_waves" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "judging_waves_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hackathon_id" integer NOT NULL,
	"label" varchar(255) NOT NULL,
	"kind" "judging_kind" DEFAULT 'software' NOT NULL,
	"starts_at" timestamp with time zone,
	"ends_at" timestamp with time zone,
	"location" varchar(255),
	"status" "judging_wave_status" DEFAULT 'scheduled' NOT NULL,
	"target_size" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "judging_wave_assignments" (
	"wave_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "judging_wave_assignments_wave_id_team_id_pk" PRIMARY KEY("wave_id","team_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "devpost_projects" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "devpost_projects_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hackathon_id" integer NOT NULL,
	"team_id" integer,
	"title" varchar(512) NOT NULL,
	"submission_url" text,
	"tracks" text[] DEFAULT '{}' NOT NULL,
	"kind" "judging_kind" DEFAULT 'software' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "judge_invite_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "judge_invite_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"token" varchar(128) NOT NULL,
	"hackathon_id" integer NOT NULL,
	"created_by" integer,
	"kind" "judging_kind" DEFAULT 'software' NOT NULL,
	"expires_at" timestamp with time zone,
	"max_uses" integer,
	"use_count" integer DEFAULT 0 NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "judge_invite_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hackathon_judges" (
	"hackathon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"kind" "judging_kind" DEFAULT 'software' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "hackathon_judges_hackathon_id_user_id_pk" PRIMARY KEY("hackathon_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "judging_assignments" ADD COLUMN IF NOT EXISTS "raw_score" double precision;
--> statement-breakpoint
ALTER TABLE "judging_assignments" ADD COLUMN IF NOT EXISTS "normalized_score" double precision;
--> statement-breakpoint
ALTER TABLE "judging_waves" ADD CONSTRAINT "judging_waves_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "judging_wave_assignments" ADD CONSTRAINT "judging_wave_assignments_wave_id_judging_waves_id_fk" FOREIGN KEY ("wave_id") REFERENCES "public"."judging_waves"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "judging_wave_assignments" ADD CONSTRAINT "judging_wave_assignments_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "devpost_projects" ADD CONSTRAINT "devpost_projects_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "devpost_projects" ADD CONSTRAINT "devpost_projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "judge_invite_tokens" ADD CONSTRAINT "judge_invite_tokens_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "judge_invite_tokens" ADD CONSTRAINT "judge_invite_tokens_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "hackathon_judges" ADD CONSTRAINT "hackathon_judges_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "hackathon_judges" ADD CONSTRAINT "hackathon_judges_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "judging_waves_hackathon_id_idx" ON "judging_waves" USING btree ("hackathon_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "judging_waves_hackathon_status_idx" ON "judging_waves" USING btree ("hackathon_id","status");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "judging_wave_assignments_team_unique" ON "judging_wave_assignments" USING btree ("team_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "judging_wave_assignments_wave_position_idx" ON "judging_wave_assignments" USING btree ("wave_id","position");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "devpost_projects_hackathon_id_idx" ON "devpost_projects" USING btree ("hackathon_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "devpost_projects_team_id_idx" ON "devpost_projects" USING btree ("team_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "devpost_projects_hackathon_kind_idx" ON "devpost_projects" USING btree ("hackathon_id","kind");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "judge_invite_tokens_hackathon_id_idx" ON "judge_invite_tokens" USING btree ("hackathon_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "judge_invite_tokens_token_idx" ON "judge_invite_tokens" USING btree ("token");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "hackathon_judges_hackathon_kind_idx" ON "hackathon_judges" USING btree ("hackathon_id","kind");
