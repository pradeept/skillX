import type { ErrorRequestHandler, NextFunction, Response } from "express";
import { AppError } from "../utils/AppError.ts";
import { ZodError } from "zod";

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: any,
  res: Response,
  next: NextFunction
) => {
  // defaults
  let statusCode = 500;
  let status = "error";
  let message = "Internal Server Error. The issue has been reported.";

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err instanceof ZodError) {
    statusCode = 400;
    message = `[${err.issues.map((issue) => issue.message).join(", ")}]`;
  }

  res.status(statusCode).json({ status, message });
};
