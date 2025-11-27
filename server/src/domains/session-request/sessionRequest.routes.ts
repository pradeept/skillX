import { Router } from "express";
import { isAuthorized } from "../../middlewares/authorize.ts";
import {
  createSessionRequest,
  getAllSessionRequests,
  updateSessionRequest,
} from "./sessionRequest.controller.ts";
import { asyncHandler } from "../../middlewares/asyncHandler.ts";

export const sessionRequestRouter = Router();

// get all session requests of a user
sessionRequestRouter.get(
  "/",
  isAuthorized,
  asyncHandler(getAllSessionRequests)
);

// create new request
sessionRequestRouter.post(
  "/",
  isAuthorized,
  asyncHandler(createSessionRequest)
);

// update a request
sessionRequestRouter.put(
  "/:id/:status",
  isAuthorized,
  asyncHandler(updateSessionRequest)
);
