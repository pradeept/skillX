import * as sessionRequestService from "./sessionRequest.service.ts";
import type { NextFunction, Request, Response } from "express";
import { sessionRequestValidation } from "./sessionRequest.schema.ts";
import * as notificationService from "../notification/notification.service.ts";
import { AppError } from "../../utils/AppError.ts";
import z from "zod";


export const getAllSessionRequests = async (
  req: Request & { data?: any },
  res: Response
) => {
  const { id } = req.data; // from decoding jwt token
  const validatedId = z.uuid().parse(id);

  const sessions = await sessionRequestService.findAllSessionRequests(validatedId);

  return res.status(200).json({
    status: "success",
    sessions,
  });
};


export const createSessionRequest = async (
  req: Request & { data?: any; notify?: any },
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
  if (newSessionRequest.length > 0) {
    console.log("Session request added successfully");

    const notifyFn = req.notify;
    const userId = newSessionRequest[0]?.provider_id;

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
      //   data: newSessionRequest[0],
    });
  } else {
    console.log("Failed to add session Request");
    return next(new AppError("Failed to update skills", 500));
  }
};



export const updateSessionRequest = async (
  req: Request & { data?: any; notify: any },
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

  const updatedSessionRequest = await sessionRequestService.updateSessionRequestStatus(
    {
      id: validatedId,
      status: validatedParams.status,
    }
  );

  if (!updatedSessionRequest) {
    return next(
      new AppError(`Failed to ${validatedParams.status} session request`, 500)
    );
  } else {
    const notifyFn = req.notify;
    const userId = updatedSessionRequest.requester_id;

    const newNotification = await notificationService.createNotification(
      notifyFn,
      userId,
      `Session request ${validatedParams.status} successfully`
    );

    if (!newNotification)
      return next(new AppError("Failed to create notification", 500));

    return res
      .status(200)
      .json(`Session request ${validatedParams.status} successfully`);
  }

  //---
  // create notification in db & push (if online) to requester (student)
  //---
  //if status is accepted CREATE this entry in sessions table link the request.
  //---
  // if status is completed from both provider and requester - credit & debit points
  // accordingly. create notifications of points
};
