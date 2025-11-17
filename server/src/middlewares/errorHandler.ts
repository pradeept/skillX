import type { ErrorRequestHandler, NextFunction, Response } from "express";
import { AppError } from "../utils/AppError.ts";
import { ZodError } from "zod";
import {
  DrizzleError,
  DrizzleQueryError,
  TransactionRollbackError,
} from "drizzle-orm";

export const errorHandler: ErrorRequestHandler = (
  err: Error | AppError,
  req: any,
  res: Response,
  next: NextFunction
) => {
  // defaults
  let statusCode = 500;
  let status = "error";
  let message = "Internal Server Error.";

  console.error(err);

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  if (err instanceof ZodError) {
    statusCode = 400;
    message = `[${err.issues.map((issue) => issue.message).join(", ")}]`;
  }

  if (err instanceof DrizzleQueryError) {
    statusCode = 500;
    message = "Failed to process your request";
  }

  if (err instanceof TransactionRollbackError) {
    console.log("❌Transaction failed");
    statusCode = 500;
    message = "Failed to process your request";
  }

  if (err instanceof DrizzleError) {
    statusCode = 500;
  }

  res.status(statusCode).json({ status, message });
};
