ALTER TABLE "session" ALTER COLUMN "scheduled_datetime" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "video_meet" ADD COLUMN "session" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "video_meet" ADD CONSTRAINT "video_meet_session_session_id_fk" FOREIGN KEY ("session") REFERENCES "public"."session"("id") ON DELETE no action ON UPDATE no action;