ALTER TABLE "challenge_completions" DROP CONSTRAINT "challenge_completions_challenge_id_user_id_pk";
--> statement-breakpoint
ALTER TABLE "challenge_completions" ADD COLUMN "id" integer GENERATED ALWAYS AS IDENTITY NOT NULL;
--> statement-breakpoint
ALTER TABLE "challenge_completions" ADD CONSTRAINT "challenge_completions_pkey" PRIMARY KEY("id");
--> statement-breakpoint
CREATE INDEX "challenge_completions_challenge_user_idx" ON "challenge_completions" USING btree ("challenge_id","user_id");
