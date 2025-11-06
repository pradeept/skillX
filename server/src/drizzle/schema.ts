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
  email: varchar({ length: 50 }).notNull().unique(),
  password_hash: varchar({ length: 255 }).notNull(),
  bio: varchar({ length: 200 }),
  avatar_url: varchar({ length: 50 }).default(
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
