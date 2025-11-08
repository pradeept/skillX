import { Router } from "express";
import { getProfile, updateProfile } from "../controllers/profileController.ts";
import { isAuthorized } from "../middlewares/authorize.ts";

export const profileRouter = Router();

// get profile using userId
profileRouter.get("/", isAuthorized, getProfile);

// put profile - to update profile
profileRouter.put("/", isAuthorized, updateProfile);

// delete profile - to update profile status
// profileRouter.delete("/");
