import { Router } from "express";
import { isAuthorized } from "../../middlewares/authorize.ts";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { markNotificationRead } from "./notification.controller.ts";

const notificationRouter = Router();

// notificationRouter.get("/", isAuthorized);

notificationRouter.patch(
  "/:id",
  isAuthorized,
  asyncHandler(markNotificationRead),
);

export { notificationRouter };
