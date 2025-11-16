import { Router } from "express";
import { isAuthorized } from "../../middlewares/authorize.ts";
import {
  getAllSessions,
  getOneSession,
  updateSessionStatus,
} from "./session.controller.ts";

export const sessionRouter = Router();

// get all sessions of a user - session requests and sessions
sessionRouter.get("/", isAuthorized, getAllSessions);

// get info of a particular session with reviews
sessionRouter.get("/:id", isAuthorized, getOneSession);

// update session status
sessionRouter.put("/", isAuthorized, updateSessionStatus);
