import z from "zod";
import * as sessionService from "./session.service.ts";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError.ts";
import * as notificationService from "../notification/notification.service.ts";
import { updateSessionSchema } from "./session.schema.ts";

export const getAllSessions = async (
  req: Request & { data?: any },
  res: Response,
  next: NextFunction
) => {
  const { id } = req.data; // from decoding jwt token
  const validatedId = z.uuid().parse(id);

  const sessions = await sessionService.findAllSessions(validatedId);

  return res.status(200).json({
    status: "success",
    message: "Sessions found",
    data: sessions,
  });
};

// get details of one session
export const getOneSession = async (
  req: Request & { data?: any },
  res: Response
) => {
  const sessionId = req.params.id;
  const validatedId = z.uuid().parse(sessionId);

  const sessionDetails = await sessionService.findOneSessionWithReview(
    validatedId
  );
  return res.status(200).json({
    status: "success",
    sessionDetails,
  });
};

// update session status 
export const updateSessionStatus = async (
  req: Request & { data: any; notify: any },
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  const userId = req.data.id;
  const validatedBody = updateSessionSchema.parse(body);
  const notifyFn = req.notify;

  // check sessionId is valid
  const isSessionExists = await sessionService.findOneSession(
    validatedBody.sessionId
  );

  if (!isSessionExists) {
    return next(new AppError("Session not found", 404));
  }

  let updatedSession;

  if (
    validatedBody.status === "completed" &&
    isSessionExists.teacher_marked_complete &&
    isSessionExists.learner_marked_complete
  ) {
    updatedSession = await sessionService.updateSessionStatus(
      validatedBody,
      undefined
    );
    const notifyTeacher = await notificationService.createNotification(
      notifyFn,
      isSessionExists.teacher_id,
      "Session is completed. Provide a review and earn points"
    );
    const notifyStudent = await notificationService.createNotification(
      notifyFn,
      isSessionExists.learner_id,
      "Session is completed. Provide a review and earn points"
    );
    if (!notifyTeacher || !notifyStudent)
      console.log("Failed to create notifications");
    // ADD TRIGGER IN SCHEMA for user details updation
  } else if (
    (validatedBody.status === "completed" &&
      isSessionExists.teacher_marked_complete) ||
    isSessionExists.learner_marked_complete
  ) {
    const markedBy =
      validatedBody.status === "completed" &&
      userId === isSessionExists.teacher_id
        ? "teacher"
        : "learner";
    updatedSession = await sessionService.updateSessionStatus(
      validatedBody,
      markedBy
    );
    const notify = await notificationService.createNotification(
      notifyFn,
      markedBy === "teacher"
        ? isSessionExists.learner_id
        : isSessionExists.teacher_id,
      `Session has been marked complete by ${
        markedBy === "learner" ? "student" : "teacher"
      }`
    );
    if (!notify) console.log("Failed to create notification");
  } else if (validatedBody.status === "cancelled") {
    // only student can cancel a session
    if (!isSessionExists.learner_id === userId) {
      return res.status(400).json({
        status: "error",
        message: "You are not the requester of this session",
      });
    } else {
      updatedSession = await sessionService.updateSessionStatus(
        validatedBody,
        undefined
      );
    }
    //DEDUCT POINTS
    //notify teacher
    const notify = await notificationService.createNotification(
      notifyFn,
      isSessionExists.teacher_id,
      `Session has been cancelled by ${userId}`
    );
    if (!notify) console.log("Failed to create notification");
  } else {
    // no_show - UPDATE AFTER IMPLEMENTING VIDEO CONF feat
    updatedSession = await sessionService.updateSessionStatus(
      validatedBody,
      undefined
    );
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
