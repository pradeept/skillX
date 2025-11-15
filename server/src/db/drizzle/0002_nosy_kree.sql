CREATE TYPE "public"."reason" AS ENUM('session_completed', 'signup_bonus', 'review_given');--> statement-breakpoint
CREATE TYPE "public"."transaction_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TABLE "points_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"transaction_type" "transaction_type" NOT NULL,
	"reason" "reason" NOT NULL,
	"amount" smallint NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_skills" ALTER COLUMN "user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "user_skills" ALTER COLUMN "skill_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "points_transaction" ADD CONSTRAINT "points_transaction_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "skills" ADD CONSTRAINT "skills_skill_name_unique" UNIQUE("skill_name");