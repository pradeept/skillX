import z from "zod";
import * as sessionService from "./session.service.ts";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError.ts";
import * as notificationService from "../notification/notification.service.ts";
import { updateSessionSchema } from "./session.schema.ts";

export const getAllSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { id } = req.data; // from decoding jwt token
  const validatedId = z.uuid().parse(id);

  const sessions = await sessionService.findAllSessions(validatedId);

  return res.status(200).json({
    status: "success",
    message: `${sessions.length} sessions found`,
    data: sessions,
  });
};

// get details of one session
export const getOneSession = async (req: Request, res: Response) => {
  const sessionId = req.params.id;
  const validatedId = z.uuid().parse(sessionId);

  const sessionDetails = await sessionService.findOneSessionWithReview(
    validatedId
  );
  return res.status(200).json({
    status: "success",
    data: sessionDetails,
  });
};

// update session status
export const updateSessionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  const userId = req.data.id;
  const validatedBody = updateSessionSchema.parse(body);
  const notifyFn = req.notify;
  const { sessionId, status } = validatedBody;

  const updatedSession = await sessionService.updateSessionStatus(
    sessionId,
    status,
    userId
  );

  if (!updatedSession) {
    throw new AppError("Failed to update the sesion", 500);
  }

  if (
    updatedSession.teacher_marked_complete &&
    updatedSession.learner_marked_complete
  ) {
    const notifyTeacher = await notificationService.createNotification(
      notifyFn,
      updatedSession.teacher_id,
      "Session is completed. Provide a review and earn points"
    );
    const notifyStudent = await notificationService.createNotification(
      notifyFn,
      updatedSession.learner_id,
      "Session is completed. Provide a review and earn points"
    );
    if (!notifyTeacher || !notifyStudent)
      console.log("Failed to create notifications");
    // ADD TRIGGER IN SCHEMA for user details updation
  } else if (
    (status === "completed" && updatedSession.teacher_marked_complete) ||
    updatedSession.learner_marked_complete
  ) {
    const markedBy =
      validatedBody.status === "completed" &&
      userId === updatedSession.teacher_id
        ? "teacher"
        : "learner";

    const notify = await notificationService.createNotification(
      notifyFn,
      markedBy === "teacher"
        ? updatedSession.learner_id
        : updatedSession.teacher_id,
      `Session has been marked complete by ${
        markedBy === "learner" ? "student" : "teacher"
      }`
    );
    if (!notify) console.log("Failed to create notification");
  } else if (validatedBody.status === "cancelled") {
    //notify teacher
    const notify = await notificationService.createNotification(
      notifyFn,
      updatedSession.teacher_id,
      `Session has been cancelled by ${userId}`
    );
    if (!notify) console.log("Failed to create notification");
  } else {
    // no_show - UPDATE AFTER IMPLEMENTING VIDEO CONF feat
    // DEDUCT POINTS
    // NOTIFY BOTH
  }

  if (!updatedSession) {
    return next(new AppError("Failed to update session", 500));
  }

  return res.status(200).json({
    status: "success",
  });
};
