import { Router } from "express";
import {
  addOrUpdateSkill,
  getCategories,
  getSkill,
} from "./skill.controller.ts";
import { isAuthorized } from "../../middlewares/authorize.ts";
export const skillRouter = Router();

// Get skill of a user - offering/wanting
skillRouter.get("/", isAuthorized, getSkill);

skillRouter.get("/category", isAuthorized, getCategories);

// add new skill
skillRouter.post("/", isAuthorized, addOrUpdateSkill);
