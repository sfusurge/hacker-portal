CREATE TABLE "house_memberships" (
	"hackathon_id" integer NOT NULL,
	"house_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "house_memberships_house_id_user_id_pk" PRIMARY KEY("house_id","user_id"),
	CONSTRAINT "house_memberships_hackathon_id_user_id_unique" UNIQUE("hackathon_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "houses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "houses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"hackathon_id" integer NOT NULL,
	"name" varchar(128) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "houses_hackathon_id_name_unique" UNIQUE("hackathon_id","name")
);
--> statement-breakpoint
CREATE TABLE "nfc_cards" (
	"tag_uid" varchar(64) PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"hackathon_id" integer NOT NULL,
	"provisioned_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rsvps" (
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rsvp_time" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "rsvps_event_id_user_id_pk" PRIMARY KEY("event_id","user_id")
);
--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "points" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "house_memberships" ADD CONSTRAINT "house_memberships_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_memberships" ADD CONSTRAINT "house_memberships_house_id_houses_id_fk" FOREIGN KEY ("house_id") REFERENCES "public"."houses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "house_memberships" ADD CONSTRAINT "house_memberships_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "houses" ADD CONSTRAINT "houses_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD CONSTRAINT "nfc_cards_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nfc_cards" ADD CONSTRAINT "nfc_cards_hackathon_id_hackathons_id_fk" FOREIGN KEY ("hackathon_id") REFERENCES "public"."hackathons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rsvps" ADD CONSTRAINT "rsvps_user_id_events_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "house_memberships_user_id_index" ON "house_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "house_memberships_house_id_index" ON "house_memberships" USING btree ("house_id");--> statement-breakpoint
CREATE INDEX "houses_hackathon_id_index" ON "houses" USING btree ("hackathon_id");--> statement-breakpoint
CREATE UNIQUE INDEX "nfc_cards_user_hackathon_uidx" ON "nfc_cards" USING btree ("user_id","hackathon_id");--> statement-breakpoint
CREATE INDEX "nfc_cards_user_id_idx" ON "nfc_cards" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "nfc_cards_hackathon_id_idx" ON "nfc_cards" USING btree ("hackathon_id");--> statement-breakpoint
CREATE INDEX "rsvps_user_id_index" ON "rsvps" USING btree ("user_id");