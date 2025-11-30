import type { Request, Response } from "express";
import z from "zod";

export const handleMeet = async (req: Request, res: Response) => {
  // const userId = req.data.id
  const videoId = req.params.id;

  // const validatedVideoId = z.uuid().parse(videoId)
  console.log(videoId);
  // const videoIdExists =

  res.status(200).json({ status: "success", data: { roomId: "youcanjoinme" } });
};
