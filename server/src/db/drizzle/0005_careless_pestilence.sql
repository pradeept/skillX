ALTER TYPE "public"."reason" ADD VALUE 'session_cancelled';--> statement-breakpoint
ALTER TYPE "public"."reason" ADD VALUE 'no_show';--> statement-breakpoint
ALTER TYPE "public"."reason" ADD VALUE 'session_requested';--> statement-breakpoint
CREATE TABLE "video_meet" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"participant_one" uuid NOT NULL,
	"participant_two" uuid NOT NULL,
	"isParticipantOneAttended" boolean DEFAULT false,
	"isParticipantTwoAttended" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "video_meet" ADD CONSTRAINT "video_meet_participant_one_users_id_fk" FOREIGN KEY ("participant_one") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "video_meet" ADD CONSTRAINT "video_meet_participant_two_users_id_fk" FOREIGN KEY ("participant_two") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;