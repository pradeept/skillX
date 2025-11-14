ALTER TYPE "public"."status" RENAME TO "request_status";--> statement-breakpoint
ALTER TYPE "public"."session_status" ADD VALUE 'no_show';--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"message" varchar(255) NOT NULL,
	"read" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "provider_id" TO "teacher_id";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "requester_id" TO "learner_id";--> statement-breakpoint
ALTER TABLE "session" RENAME COLUMN "session_status" TO "status";--> statement-breakpoint
ALTER TABLE "session_request" RENAME COLUMN "schedule" TO "proposed_datetime";--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_requester_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session" DROP CONSTRAINT "session_provider_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session_request" DROP CONSTRAINT "session_request_requester_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session_request" DROP CONSTRAINT "session_request_provider_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "session_request" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "session_request" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."request_status";--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('pending', 'accepted', 'declined', 'cancelled');--> statement-breakpoint
ALTER TABLE "session_request" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."request_status";--> statement-breakpoint
ALTER TABLE "session_request" ALTER COLUMN "status" SET DATA TYPE "public"."request_status" USING "status"::"public"."request_status";--> statement-breakpoint
ALTER TABLE "session" ALTER COLUMN "completed_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "session_request" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session_request" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "created_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "request_id" uuid;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "skill_id" uuid;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "scheduled_datetime" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "teacher_marked_complete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "learner_marked_complete" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "session_request" ADD COLUMN "skill_id" uuid;--> statement-breakpoint
ALTER TABLE "session_request" ADD COLUMN "message" varchar(500);--> statement-breakpoint
ALTER TABLE "session_request" ADD COLUMN "declined_reason" varchar(500);--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_request_id_session_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."session_request"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_teacher_id_users_id_fk" FOREIGN KEY ("teacher_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_learner_id_users_id_fk" FOREIGN KEY ("learner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_request" ADD CONSTRAINT "session_request_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_request" ADD CONSTRAINT "session_request_requester_id_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_request" ADD CONSTRAINT "session_request_provider_id_users_id_fk" FOREIGN KEY ("provider_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_request" DROP COLUMN "requester_message";--> statement-breakpoint
ALTER TABLE "session_request" DROP COLUMN "provider_message";--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_request_id_unique" UNIQUE("request_id");