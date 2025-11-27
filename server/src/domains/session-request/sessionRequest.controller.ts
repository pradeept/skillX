import * as sessionRequestService from "./sessionRequest.service.ts";
import type { NextFunction, Request, Response } from "express";
import { sessionRequestValidation } from "./sessionRequest.schema.ts";
import * as notificationService from "../notification/notification.service.ts";
import { AppError } from "../../utils/AppError.ts";
import z from "zod";

export const getAllSessionRequests = async (req: Request, res: Response) => {
  const { id } = req.data; // from decoding jwt token
  const validatedId = z.uuid().parse(id);

  const sessionRequests = await sessionRequestService.findAllSessionRequests(
    validatedId
  );

  return res.status(200).json({
    status: "success",
    message: `${sessionRequests.length} Session requests found`,
    data: sessionRequests,
  });
};

export const createSessionRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.data;
  const validatedId = z.uuid().parse(id);
  const body = req.body;

  const validatedBody = sessionRequestValidation.parse(body);
  const newSessionRequest = await sessionRequestService.insertSessionRequest({
    requesterId: validatedId,
    providerId: validatedBody.providerId,
    schedule: validatedBody.schedule,
    skillId: validatedBody.skillId,
  });
  if (newSessionRequest) {
    console.log("Session request added successfully");

    const notifyFn = req.notify;
    const userId = newSessionRequest.provider_id;

    const newNotification = await notificationService.createNotification(
      notifyFn,
      userId as string,
      `New session request`
    );

    if (!newNotification)
      return next(new AppError("Failed to create notification", 500));

    return res.status(200).json({
      status: "success",
      message: "Session requested successfully",
      data: {
        id: newSessionRequest.id,
        requesterId: newSessionRequest.requester_id,
        providerId: newSessionRequest.provider_id,
        skillId: newSessionRequest.skill_id,
        schedule: newSessionRequest.proposed_datetime,
        status: newSessionRequest.status,
      },
    });
  } else {
    console.log("Failed to create session Request");
    return next(new AppError("Failed to create session request", 500));
  }
};

export const updateSessionRequest = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.data;
  const validatedId = z.uuid().parse(id);
  const sessionRequestId = req.params.id;
  const newStatus = req.params.status;

  const updateSessionRequestStatusSchema = z.object({
    id: z.uuid("id is required").min(36).max(36),
    status: z.enum(["accepted", "declined", "cancelled"], {
      error: "invalid status type",
    }),
  });
  const validatedParams = updateSessionRequestStatusSchema.parse({
    id: sessionRequestId,
    status: newStatus,
  });

  const updatedSessionRequest =
    await sessionRequestService.updateSessionRequestStatus({
      userId: validatedId,
      sessionRequestId: validatedParams.id,
      status: validatedParams.status,
    });

  if (!updatedSessionRequest) {
    return next(
      new AppError(`Failed to ${validatedParams.status} session request`, 500)
    );
  } else {
    const notifyFn = req.notify;
    const learnerId = updatedSessionRequest.requester_id;
    const teacherId = updatedSessionRequest.provider_id;
    const notifyUserId =
      validatedParams.status === "accepted" ||
      validatedParams.status === "declined"
        ? learnerId
        : teacherId;

    const newNotification = await notificationService.createNotification(
      notifyFn,
      notifyUserId,
      `Session request ${validatedParams.status} successfully`
    );

    if (!newNotification)
      return next(new AppError("Failed to create notification", 500));

    return res
      .status(200)
      .json(`Session request ${validatedParams.status} successfully`);
  }
};
