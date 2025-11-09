import z from "zod";
import * as skillService from "../services/skillService.ts";
import { type Request, type Response } from "express";
export const getSkill = async (
  req: Request & { data?: any },
  res: Response
) => {
  const id = req.data;

  const validated = z.string().parse(id);

  const skills: {
    id: string;
    skill_name: string;
    category: string;
    type: string;
  }[] = await skillService.getUserSkills(validated);
  return res.status(200).json({
    status: "success",
    skills,
  });
};

export const addSkill = async () => {};

export const updateSkill = async () => {};
