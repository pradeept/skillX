import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";
import { handleMeet } from "./videoMeet.controller.ts";
import { isAuthorized } from "../../middlewares/authorize.ts";

export const videoConfRouter = Router();

videoConfRouter.get("/:id", asyncHandler(handleMeet));
