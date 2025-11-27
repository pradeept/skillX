import { eq, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import { User } from "../../db/drizzle/schema.ts";
import type { UserType } from "../auth/user.types.ts";
import { findUserByEmail } from "../auth/auth.service.ts";

export const getUserDetails = findUserByEmail;

export const findUserById = async (id: string) => {
  const user = await db.select().from(User).where(eq(User.id, id));
  if (user.length > 0) {
    const foundUser = user[0];
    return foundUser;
  } else {
    return null;
  }
};

export const updateUserDetails = async (data: Partial<UserType>) => {
  const { id, full_name, bio, avatar_url } = data;
  const updatedUser = await db
    .update(User)
    .set({
      full_name,
      bio,
      avatar_url,
      updated_at: sql`now()`,
    })
    .where(eq(User.id, id!))
    .returning();
  return updatedUser[0];
};

export const deleteUserAccount = async (id: string) => {
  const userId = id;
  const deletedUser = await db
    .update(User)
    .set({ account_status: "suspended", updated_at: sql`now()` })
    .where(eq(User.id, userId))
    .returning({ id: User.id });
  return deletedUser[0];
};
