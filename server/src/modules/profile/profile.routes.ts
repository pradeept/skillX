import { Router } from "express";
import {
  deleteProfile,
  getProfile,
  updateProfile,
} from "./profile.controller.ts";
import { isAuthorized } from "../../middlewares/authorize.ts";

export const profileRouter = Router();

profileRouter.get("/", isAuthorized, getProfile);

profileRouter.put("/", isAuthorized, updateProfile);

profileRouter.delete("/", isAuthorized, deleteProfile);
