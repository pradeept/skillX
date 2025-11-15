import { Router } from "express";
import { isAuthorized } from "../../middlewares/authorize.ts";
import { getAllSessionRequests } from "./sessionRequest.controller.ts";

export const sessionRequestRouter = Router();

// get all session requests of a user
//@ts-ignore
sessionRequestRouter.get("/", isAuthorized, getAllSessionRequests);

//@ts-ignore

sessionRequestRouter.post("/", isAuthorized, createSessionRequest);
//@ts-ignore

sessionRequestRouter.put("/:id", isAuthorized, updateSessionRequest);

