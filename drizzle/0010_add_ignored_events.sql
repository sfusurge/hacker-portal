CREATE TABLE "ignored_events" (
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	CONSTRAINT "ignored_events_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "ignored_events" ADD CONSTRAINT "ignored_events_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "ignored_events" ADD CONSTRAINT "ignored_events_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "ignored_events_user_id_index" ON "ignored_events" USING btree ("user_id");
