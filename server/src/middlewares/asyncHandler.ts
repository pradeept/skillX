import type { NextFunction, Request, Response } from "express";

// handles synchronous and asynchronous errors
export const asyncHandler =
  (controllerFn: any) => (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(controllerFn(req, res, next)).catch(next);
