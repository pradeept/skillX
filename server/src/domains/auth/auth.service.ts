import { eq, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import { User } from "../../db/drizzle/schema.ts";

export const findUserByEmail = async (email: string) => {
  const user = await db.select().from(User).where(eq(User.email, email));

  if (user.length > 0) {
    const foundUser = user[0];
    return foundUser;
  } else {
    return null;
  }
};

export const createNewUser = async (userData: {
  email: string;
  password_hash: string;
  full_name: string;
}) => {
  const { full_name, email, password_hash } = userData;
  const newUser = await db
    .insert(User)
    .values({
      full_name,
      email,
      password_hash,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .returning();
  return newUser[0];
};
