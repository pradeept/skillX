import { and, count, desc, eq, ilike, not } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import { User } from "../../db/drizzle/schema.ts";
import { AppError } from "../../utils/AppError.ts";

export const getProfilesCount = async () => {
  const usersCount = await db.select({ totalCount: count() }).from(User);
  if (usersCount.length == 0 || !usersCount[0]) {
    console.error("There are no users or failed to execute the query");
    throw new AppError("Internal server error", 500);
  }
  return usersCount[0].totalCount;
};

// id: uuid().primaryKey().defaultRandom(),
//   full_name: varchar({ length: 50 }).notNull(),
//   email: varchar({ length: 100 }).notNull().unique(),
//   password_hash: varchar({ length: 255 }).notNull(),
//   bio: varchar({ length: 200 }),
//   avatar_url: varchar({ length: 255 }).default(
//     "https://cdn-icons-png.flaticon.com/512/847/847969.png",
//   ),

//   // score
//   total_lessons_taught: integer().default(0),
//   total_lessons_learned: integer().default(0),
//   points: smallint().default(50).notNull(),
//   level: levelsEnum("level").default("beginner").notNull(),

//   // account
//   account_status: accountStatusEnum("account_status").default("active"),

export const getProfilesByLevel = async (
  pageSize: number,
  offset: number,
  currUserId: string,
) => {
  // default: fetch users with better level
  const profiles = db
    .select({
      id: User.id,
      fullName: User.full_name,
      bio: User.bio,
      avatarURL: User.avatar_url,
      level: User.level,
    })
    .from(User)
    .where(and(eq(User.account_status, "active"), not(eq(User.id, currUserId))))
    .orderBy(desc(User.level))
    .offset(offset)
    .limit(pageSize);
};

export const findByName = async (
  name: string,
  offset: number,
  pageSize: number,
) => {
  const profiles = await db
    .select({
      id: User.id,
      fullName: User.full_name,
      bio: User.bio,
      avatarURL: User.avatar_url,
      level: User.level,
    })
    .from(User)
    .where(ilike(User.full_name, `${name}%`))
    .offset(offset)
    .limit(pageSize);

  return profiles;
};
