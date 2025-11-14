import { Router } from "express";
import { isAuthorized } from "../middlewares/authorize.ts";
import { createSessionRequest, getAllSessions, getOneSession, updateSessionRequest } from "../controllers/sessionController.ts";

export const sessionRouter = Router();

// get all sessions of a user - session requests and sessions
sessionRouter.get("/", isAuthorized, getAllSessions);

// get info of a particular session with reviews
sessionRouter.get('/:id', isAuthorized, getOneSession)

// create a session request
sessionRouter.post("/", isAuthorized, createSessionRequest)

// update session status
sessionRouter.put("/:id", isAuthorized, updateSessionRequest);

// change 'session request' status to accepted/declined/cancelled
// default it will be pending
