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
    .where(
      and(ilike(User.full_name, `${name}%`), eq(User.account_status, "active")),
    )
    .offset(offset)
    .limit(pageSize);

  return profiles;
};
