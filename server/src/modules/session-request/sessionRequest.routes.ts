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

/*

8053ada2-9c3c-4fa5-a004-9cc415c57d1e - pradeep usedId

pradeepa offers
3bc99182-cfc5-448e-84c6-d66f15de2f2c - node skill
*/