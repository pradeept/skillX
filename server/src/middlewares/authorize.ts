import type { NextFunction, Request } from "express";
import { AppError } from "../utils/AppError.ts";
import { verifyToken } from "../utils/jwt.ts";

export const isAuthorized = async (
  req: Request & { data?: any },
  _: any,
  next: NextFunction,
) => {
  const { token } = req.cookies;
  if (!token || token.length === 0) {
    return next(
      new AppError("You are not logged in to make this request", 403),
    );
  }
  const cleanToken = token.replace("Bearer ", "");

  const userDetails = verifyToken(cleanToken);
  if (userDetails) {
    req.data = userDetails;
    next();
  } else {
    return next(
      new AppError("You are not logged in to make this request", 403),
    );
  }
};
