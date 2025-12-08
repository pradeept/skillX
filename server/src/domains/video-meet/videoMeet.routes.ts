import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { handleMeet } from "./videoMeet.controller.ts";
import { isAuthorized } from "../../middlewares/authorize.ts";

export const videoMeetRouter = Router();

videoMeetRouter.get("/:id", asyncHandler(handleMeet));
