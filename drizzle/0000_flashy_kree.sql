CREATE TYPE "public"."status" AS ENUM('N/A', 'Awaiting Review', 'Accepted', 'Declined', 'Wait List');--> statement-breakpoint
CREATE TYPE "public"."type" AS ENUM('MULTIPLE_CHOICE', 'TEXT', 'NUMBER', 'CHECKBOX', 'TEXT_AREA');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('google', 'github', 'email');--> statement-breakpoint
CREATE TABLE "applications" (
	"hackathon_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"currentStatus" "status" DEFAULT 'Awaiting Review' NOT NULL,
	"pendingStatus" "status" DEFAULT 'N/A' NOT NULL,
	"response" json NOT NULL,
	"createdDate" timestamp DEFAULT now() NOT NULL,
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
CREATE TABLE "questions" (
	"hackathon_id" integer NOT NULL,
	"question_number" serial NOT NULL,
	"content" varchar(2048) NOT NULL,
	"type" "type" NOT NULL,
	"required" boolean DEFAULT true,
	CONSTRAINT "questions_hackathon_id_question_number_pk" PRIMARY KEY("hackathon_id","question_number")
);
--> statement-breakpoint
CREATE TABLE "user_display_id" (
	"display_id" varchar(6) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "user_display_id_display_id_unique" UNIQUE("display_id"),
	CONSTRAINT "user_display_id_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"first_name" varchar(64),
	"last_name" varchar(64),
	"phone_number" varchar(15),
	"email" varchar(255),
	"is_registered" boolean DEFAULT false NOT NULL,
	"provider" varchar(32) NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_display_id" ADD CONSTRAINT "user_display_id_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "userid_index" ON "user_display_id" USING btree ("user_id");