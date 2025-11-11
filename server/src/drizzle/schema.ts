import {
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
  created_at: timestamp().defaultNow(),
  updated_at: timestamp().defaultNow(),
};

export const User = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  full_name: varchar({ length: 50 }).notNull(),
  email: varchar({ length: 100 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  bio: varchar({ length: 200 }),
  avatar_url: varchar({ length: 255 }).default(
    "https://cdn-icons-png.flaticon.com/512/847/847969.png"
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
  skill_name: varchar({ length: 20 }).notNull(),
  category_id: uuid().references(() => SkillCategory.id),
});

export const skillTypeEnum = pgEnum("type", ["offering", "wanting"]);

export const UserSkill = pgTable(
  "user_skills",
  {
    id: uuid().primaryKey().defaultRandom(),
    user_id: uuid().references(() => User.id),
    skill_id: uuid().references(() => Skill.id),
    type: skillTypeEnum("type").notNull(),
  },
  (table) => [unique().on(table.skill_id, table.user_id, table.type)]
);

// --- Session ---

export const statusEnum = pgEnum("status", [
  "accepted",
  "declined",
  "cancelled",
  "pending",
]);

export const SessionRequest = pgTable("session_request", {
  id: uuid().primaryKey().defaultRandom(),
  requester_id: uuid()
    .references(() => User.id)
    .notNull(),
  provider_id: uuid()
    .references(() => User.id)
    .notNull(),
  schedule: timestamp().notNull(),

  requester_message: varchar({ length: 255 }),

  status: statusEnum("status").default("pending").notNull(),
  provider_message: varchar({ length: 255 }),
  ...timestamps,
});

export const sessionStatusEnum = pgEnum("session_status", [
  "scheduled",
  "completed",
  "cancelled",
]);

// when provider accepts / cancels / declains => will save in session table

export const Session = pgTable("session", {
  id: uuid().primaryKey().defaultRandom(),
  requester_id: uuid()
    .references(() => User.id)
    .notNull(),
  provider_id: uuid()
    .references(() => User.id)
    .notNull(),
  session_status: sessionStatusEnum("session_status").notNull(),
  duration_minutes: smallint().default(60),
  completed_at: timestamp().notNull(),
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
  (table) => [unique().on(table.session_id, table.reviewer_id)]
); //one review per person

// --- Points ---

export const transactionTypeEnum = pgEnum("transaction_type", [
  "credit",
  "debit",
]);

export const transactionReson = pgEnum("reason", [
  "session_completed",
  "signup_bonus",
  "review_given",
]);
export const PointsTransaction = pgTable("points_transaction", {
  id: uuid().primaryKey().defaultRandom(),
  user_id: uuid().references(() => User.id),
  transaction_type: transactionTypeEnum("transaction_type").notNull(),
  reason: transactionReson("reason").notNull(),
  amount: smallint().notNull(),
});

// -- Triggers --

// function and trigger to update lessons_learned and lessons_taught 
// after a session is completed
