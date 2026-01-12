import { Router } from "express";
import {
  addOrUpdateSkill,
  getCategories,
  getSkill,
  deleteSkill,
} from "./skill.controller.ts";
import { isAuthorized } from "../../middlewares/authorize.ts";
export const skillRouter = Router();

// Get skill of a user - offering/wanting
skillRouter.get("/", isAuthorized, getSkill);

skillRouter.get("/category", isAuthorized, getCategories);


// delete skill
skillRouter.delete("/:id", isAuthorized, deleteSkill);

// add new skill
skillRouter.post("/", isAuthorized, addOrUpdateSkill);
