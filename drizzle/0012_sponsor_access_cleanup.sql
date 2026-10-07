DROP TABLE IF EXISTS "company";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."sponsor_tier";
--> statement-breakpoint
DROP TYPE IF EXISTS "public"."company_role";
--> statement-breakpoint
UPDATE "user" SET "user_role" = 'user' WHERE "user_role" = 'sponsor';
--> statement-breakpoint
ALTER TYPE "public"."user_role" RENAME TO "user_role_old";
--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user', 'judge', 'owner');
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "user_role" DROP DEFAULT;
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "user_role" TYPE "public"."user_role" USING "user_role"::text::"public"."user_role";
--> statement-breakpoint
ALTER TABLE "user" ALTER COLUMN "user_role" SET DEFAULT 'user'::"public"."user_role";
--> statement-breakpoint
DROP TYPE "public"."user_role_old";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sponsor_access_tokens" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sponsor_access_tokens_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" varchar(255) NOT NULL,
	"token" varchar(128) NOT NULL,
	"hackathon_id" integer,
	"revoked" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sponsor_access_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "sponsor_access_tokens" ADD CONSTRAINT "sponsor_access_tokens_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "sponsor_access_tokens_hackathon_id_idx" ON "sponsor_access_tokens" USING btree ("hackathon_id");
