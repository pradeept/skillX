import jwt from "jsonwebtoken";
import type { UserType } from "../types/schema.types.ts";
export const generateToken = (userDetails: Partial<UserType>) => {
  const token = jwt.sign(userDetails, process.env.JWT_SECRET as string, { expiresIn: "1h" });
  return `Bearer ${token}`
};
