import z from "zod";
import * as sessionService from "./session.service.ts";
import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../utils/AppError.ts";
import * as notificationService from "../notification/notification.service.ts";

export const getAllSessions = async (
  req: Request & { data?: any },
  res: Response
) => {
  const { id } = req.data; // from decoding jwt token
};

// get details of one session
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

export const updateSessionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  /*
    - update the status in session
    - if completed by teacher || student alone
      - send notification to student/teacher saying "ABC has marked complete"
    - if both marked completed
      - notify both to give review and earn points
      - trigger should update number of lessons_taught / lessons_learnt
    - if cancelled by requester 
      - deduct the points and update the status
      - notify the teacher
    - if no-show (based on attendance of video call)
      - deduce points from both
      - notify both of deduction
  */
  return res.status(200).json({
    status: "success",
  });
};
