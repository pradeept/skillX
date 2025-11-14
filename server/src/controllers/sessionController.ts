import z from "zod";
import * as sessionService from "../services/sessionService.ts";
import type { NextFunction, Request, Response } from "express";
import { sessionRequestValidation } from "../validators/session.schema.ts";
import { AppError } from "../utils/AppError.ts";

export const getAllSessions = async (
  req: Request & { data?: any },
  res: Response
) => {
  const { id } = req.data; // from decoding jwt token
  const validatedId = z.uuid().parse(id);

  const sessions = await sessionService.findAllSessionsOfUser(validatedId);

  return res.status(200).json({
    status: "success",
    sessions,
  });
};

export const getOneSession = async (
  req: Request & { data?: any },
  res: Response
) => {
  const { id } = req.data; // from decoding jwt token
  const validatedId = z.uuid().parse(id);

  const sessionDetails = await sessionService.findOneSession(validatedId);
  return res.status(200).json({
    status: "success",
    sessionDetails,
  });
};

export const createSessionRequest = async (
  req: Request & { data?: any },
  res: Response,
  next: NextFunction
) => {
  const { id } = req.data;
  const validatedId = z.uuid().parse(id);
  const body = req.body;

  const validatedBody = sessionRequestValidation.parse(body);
  const newSessionRequest = await sessionService.insertSessionRequest({
    title: validatedBody.title,
    description: validatedBody.description,
    requesterId: validatedId,
    providerId: validatedBody.providerId,
    schedule: validatedBody.schedule,
    skillId: validatedBody.skillId,
  });
  if (newSessionRequest.length > 0) {
    console.log("Session request added successfully");
    //-----
    // create notification in db & push (if online) to provider (teacher)
    //-----
    return res.status(200).json({
      status: "success",
      message: "Session requested successfully",
      data: newSessionRequest[0],
    });
  } else {
    console.log("Failed to add session Request");
    return next(new AppError("Failed to update skills", 500));
  }
};

export const updateSessionRequest = async (
  req: Request & { data?: any },
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

  const updatedSessionRequest = await sessionService.updateSessionRequestStatus(
    {
      id: validatedId,
      status: validatedParams.status,
    }
  );

  //---
  // create notification in db & push (if online) to requester (student)
  //---
  //if status is accepted CREATE this entry in sessions table link the request.
  //---
  // if status is completed from both provider and requester - credit & debit points
  // accordingly. create notifications of points
};
