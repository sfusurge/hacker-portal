DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "public"."rsvps" AS r
        WHERE NOT EXISTS (
            SELECT 1
            FROM "public"."user" AS u
            WHERE u."id" = r."user_id"
        )
    ) THEN
        RAISE EXCEPTION 'Cannot migrate rsvps.user_id FK: at least one RSVP row has no matching user.id';
    END IF;
END $$;
--> statement-breakpoint
ALTER TABLE "rsvps" DROP CONSTRAINT "rsvps_user_id_events_id_fk";
--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
