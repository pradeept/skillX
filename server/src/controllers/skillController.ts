import z from "zod";
import * as skillService from "../services/skillService.ts";
import { type NextFunction, type Request, type Response } from "express";
import { addSkillSchema } from "../validators/skill.schema.ts";
import { AppError } from "../utils/AppError.ts";

export const getSkill = async (
  req: Request & { data?: any },
  res: Response
) => {
  const { id } = req.data;

  const validated = z.uuid().parse(id);

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

export const addSkill = async (
  req: Request & { data?: any },
  res: Response,
  next: NextFunction
) => {
  const { id } = req.data;
  const body = req.body;
  const validatedUserId = z.uuid().parse(id);

  const validatedBody = addSkillSchema.parse(body);

  const newSkills = validatedBody.skills.map(async (skill) => {
    const isSkillExists = await skillService.findOneSkill(skill.skill_name);
    if (isSkillExists) return { skillId: isSkillExists.id };
    else {
      const newSkillId = await skillService.addOneSkill(
        skill.skill_name,
        skill.category_id
      );
      return { skillId: newSkillId };
    }
  });

  const resolvedSkills = await Promise.all(newSkills);

  const userSkills = resolvedSkills.map(async (skill) => {
    return skillService.addNewUserSkill(
      skill.skillId!,
      validatedUserId,
      validatedBody.type
    );
  });

  const resolvedCreations = await Promise.all(userSkills);

  if (resolvedCreations.some((creation) => creation === undefined)) {
    return next(new AppError("Failed to update skills", 500));
  } else {
    return res.status(200).json({
      status: "success",
      message: "Skills updated successfully",
    });
  }
};

export const updateSkill = async () => {};
