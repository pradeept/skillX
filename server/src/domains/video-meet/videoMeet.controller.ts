import type { Request, Response } from "express";
import z from "zod";
import * as videoMeetService from "./videoMeet.service.ts";

export const handleMeet = async (req: Request, res: Response) => {
  // const userId = req.data.id
  const sessionId = req.params.id;

  const validatedSessionId = z.uuid().parse(sessionId);

  const newMeetId = await videoMeetService.createVideoMeet(validatedSessionId);
  if (newMeetId) {
    res.status(200).json({ status: "success", data: { meetId: newMeetId.id } });
  }
};
