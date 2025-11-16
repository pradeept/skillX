import jwt from "jsonwebtoken";
import type { UserType } from "../modules/auth/user.types.ts";

export const generateToken = (userDetails: Partial<UserType>) => {
  const token = jwt.sign(userDetails, process.env.JWT_SECRET as string, {
    expiresIn: "1h",
  });
  return `Bearer ${token}`;
};

export const verifyToken = (token: string) => {
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET as string);
  } catch (err) {
    console.error(
      "Token verification failed:",
      err instanceof Error ? err.message : "Unknown error"
    );
  }
  return payload ?? null;
};
