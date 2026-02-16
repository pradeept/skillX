// http://localhost:3004/api/profile/search?query=node&type=skill&page=1&limit=12

import { Router } from "express";
import { isAuthorized } from "../../middlewares/authorize.ts";
import {
  searchByProfile,
  searchBySkills,
} from "./search.controller.ts";

export const searchRouter = Router();

searchRouter.get("/profiles", isAuthorized, searchByProfile);
searchRouter.get("/skills", isAuthorized, searchBySkills);
