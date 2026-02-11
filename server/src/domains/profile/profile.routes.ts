import { Router } from "express";
import {
  deleteProfile,
  getAllProfiles,
  getProfile,
  updateProfile,
} from "./profile.controller.ts";
import { isAuthorized } from "../../middlewares/authorize.ts";

export const profileRouter = Router();

profileRouter.get("/", isAuthorized, getAllProfiles);

profileRouter.get("/me", isAuthorized, getProfile);

profileRouter.put("/", isAuthorized, updateProfile);

profileRouter.delete("/", isAuthorized, deleteProfile);
