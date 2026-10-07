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
