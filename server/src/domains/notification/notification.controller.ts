import type { Request, Response } from "express";
import * as notificationService from "./notification.service.ts";
import z from "zod";
import { AppError } from "../../utils/AppError.ts";

export const markNotificationRead = async (req: Request, res: Response) => {
  const notificationId = req.params.id;
  const idSchema = z.uuid();
  const validatedId = idSchema.parse(notificationId);
  const userId = req.data.id;

  const updatedNotification = await notificationService.updateNotification(
    validatedId,
    userId,
  );

  if (!updatedNotification) {
    throw new AppError("Failed to process your request.", 500);
  }

  res.json({ status: "Success", message: "Notification status updated" });
};
