import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  smallint,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const levelsEnum = pgEnum("level", [
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export const accountStatusEnum = pgEnum("account_status", [
  "active",
  "suspended",
]);

// metadata
const timestamps = {
  created_at: timestamp().defaultNow().notNull(),
  updated_at: timestamp().defaultNow().notNull(),
};

export const User = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  full_name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  bio: varchar({ length: 200 }),
  avatar_url: varchar({ length: 255 }).default(
    "https://cdn-icons-png.flaticon.com/512/847/847969.png",
  ),

  // score
  total_lessons_taught: integer().default(0),
  total_lessons_learned: integer().default(0),
  points: smallint().default(50).notNull(),
  level: levelsEnum("level").default("beginner").notNull(),

  // account
  account_status: accountStatusEnum("account_status").default("active"),

  ...timestamps,
});

// --- SKILLS ---

export const SkillCategory = pgTable("skill_category", {
  id: uuid().primaryKey().defaultRandom(),
  category_name: varchar({ length: 30 }).notNull().unique(),
});

export const Skill = pgTable("skills", {
  id: uuid().primaryKey().defaultRandom(),
  skill_name: varchar({ length: 20 }).notNull().unique(),
  category_id: uuid().references(() => SkillCategory.id),
});

export const skillTypeEnum = pgEnum("type", ["offering", "wanting"]);

export const UserSkill = pgTable(
  "user_skills",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid()
      .references(() => User.id)
      .notNull(),
    skill_id: uuid()
      .references(() => Skill.id)
      .notNull(),
    type: skillTypeEnum("type").notNull(),
  },
  (table) => [unique().on(table.skill_id, table.user_id, table.type)],
);

// --- Session ---
export const requestStatusEnum = pgEnum("request_status", [
  "pending",
  "accepted",
  "declined",
  "cancelled", //by requester before accepted
]);

export const SessionRequest = pgTable("session_request", {
  id: uuid().primaryKey().defaultRandom(),

  requester_id: uuid()
    .references(() => User.id, { onDelete: "cascade" })
    .notNull(),
  provider_id: uuid()
    .references(() => User.id, { onDelete: "cascade" })
    .notNull(),
  skill_id: uuid().references(() => Skill.id, { onDelete: "set null" }),

  proposed_datetime: timestamp().notNull(),
  message: varchar({ length: 500 }),

  status: requestStatusEnum("status").default("pending").notNull(),
  declined_reason: varchar({ length: 500 }),

  ...timestamps,
});

export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "completed",
  "cancelled",
  "no_show",
]);

export const Session = pgTable("session", {
  id: uuid().primaryKey().defaultRandom(),

  //original request
  request_id: uuid()
    .references(() => SessionRequest.id, { onDelete: "set null" })
    .unique(),

  teacher_id: uuid()
    .references(() => User.id, { onDelete: "cascade" })
    .notNull(),
  learner_id: uuid()
    .references(() => User.id, { onDelete: "cascade" })
    .notNull(),
  skill_id: uuid().references(() => Skill.id, { onDelete: "set null" }),

  scheduled_datetime: timestamp().notNull(),
  duration_minutes: smallint().default(60),

  session_status: sessionStatusEnum("status").default("scheduled").notNull(),
  teacher_marked_complete: boolean().default(false),
  learner_marked_complete: boolean().default(false),

  completed_at: timestamp(),
  ...timestamps,
});

// --- Review ---

export const ratingEnum = pgEnum("rating", ["0", "1", "2", "3", "4", "5"]);

export const Review = pgTable(
  "review",
  {
    id: uuid().primaryKey().defaultRandom(),
    session_id: uuid().references(() => Session.id),
    reviewee_id: uuid().references(() => User.id),
    reviewer_id: uuid().references(() => User.id),
    rating: ratingEnum().default("0").notNull(),
    comment: varchar({ length: 50 }),
  },
  (table) => [unique().on(table.session_id, table.reviewer_id)],
); //one review per person

// --- Points ---

export const transactionTypeEnum = pgEnum("transaction_type", [
  "credit",
  "debit",
]);

export const transactionReason = pgEnum("reason", [
  "session_completed",
  "signup_bonus",
  "review_given",
  "session_cancelled",
  "no_show",
  "session_requested",
]);
export const PointsTransaction = pgTable("points_transaction", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .references(() => User.id)
    .notNull(),
  transaction_type: transactionTypeEnum("transaction_type").notNull(),
  reason: transactionReason("reason").notNull(),
  amount: smallint().notNull(),
});

// notification
export const Notifications = pgTable("notifications", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid()
    .references(() => User.id)
    .notNull(),
  message: varchar({ length: 255 }).notNull(),
  read: boolean().default(false).notNull(),
});

// -- Triggers --

// for updating no_of_lessons_taught / learnt

// NOTE: Ditching it for now as drizzle not yet supports
// triggers and I don't want to complicate by integrating
// libs like atlas .

// -- Video Conferencing --
export const VideoMeet = pgTable("video_meet", {
  id: uuid().primaryKey().defaultRandom(),
  participant_one: uuid()
    .references(() => User.id)
    .notNull(),
  participant_two: uuid()
    .references(() => User.id)
    .notNull(),
  isParticipantOneAttended: boolean().default(false),
  isParticipantTwoAttended: boolean().default(false),
  ...timestamps,
});
