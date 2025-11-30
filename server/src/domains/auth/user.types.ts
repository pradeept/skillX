import { User } from "../../db/drizzle/schema.ts";

export type UserType = typeof User.$inferSelect;
