import z from "zod";
import * as skillService from "./skill.service.ts";
import { type NextFunction, type Request, type Response } from "express";
import { addOrUpdateSkillSchema } from "./skill.schema.ts";
import { AppError } from "../../utils/AppError.ts";

const UNKNOWN_CATEGORY_ID = "746b22f3-7f75-4c95-b69c-e1c4e98ff349";

export const getSkill = async (req: Request, res: Response) => {
  const { id } = req.data;
  console.log("id: ", id);
  const validated = z.uuid().parse(id);

  const skills: {
    id: string;
    skillName: string;
    category: string;
    type: "offering" | "wanting";
  }[] = await skillService.getUserSkills(validated);
  return res.status(200).json({
    status: "success",
    skills,
  });
};

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const categories = await skillService.fetchAllCategories();

  return res.status(200).json({
    status: "success",
    categories,
  });
};

export const addOrUpdateSkill = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.data;
  const body = req.body;
  const validatedUserId = z.uuid().parse(data.id);

  const validatedBody = addOrUpdateSkillSchema.parse(body);

  try {
    // extract skill names
    const skillNames = validatedBody.skills.map((skill) => skill.skill_name);

    // find existing skills in "skills" table
    const existingSkills = (await skillService.findSkills(skillNames)).map(
      (skill) => ({
        user_id: validatedUserId,
        skill_id: skill.id,
        skill_name: skill.skill_name,
        type: validatedBody.type,
      }),
    );

    // find new skills that needs to be added to "skills" table
    const newSkillNames = skillNames.filter(
      (skill) => !existingSkills.map((s) => s.skill_name).includes(skill),
    );

    let newSkills;
    // format and add non existing skills to "skills" table
    if (newSkillNames.length > 0) {
      const formatedNewSkills = newSkillNames.map((skill) => {
        return {
          skill_name: skill,
          category_id:
            validatedBody.skills.find((s) => s.skill_name === skill)
              ?.category_id ?? UNKNOWN_CATEGORY_ID, //unknown category_id
          user_id: validatedUserId,
        };
      });

      newSkills = (await skillService.addNewSkills(formatedNewSkills)).map(
        (skill) => {
          return {
            skill_name: skill.skill_name,
            skill_id: skill.id,
            category_id: skill.category_id,
            user_id: validatedUserId,
            type: validatedBody.type,
          };
        },
      );
    }

    // add or update both existing and newly added skills to "user_skills" table
    let newUserSkills;
    if (newSkills) {
      newUserSkills = await skillService.addNewUserSkill([
        ...existingSkills.map((s) => ({
          user_id: s.user_id,
          skill_id: s.skill_id,
          type: s.type,
        })),
        ...newSkills,
      ]);
    } else {
      newUserSkills = await skillService.addNewUserSkill(
        existingSkills.map((s) => ({
          user_id: s.user_id,
          skill_id: s.skill_id,
          type: s.type,
        })),
      );
    }

    if (newUserSkills.length > 0) {
      console.log("User skills updated successfully");
      return res.status(200).json({
        status: "success",
        message: "Skills updated successfully",
      });
    } else {
      console.log("Failed to add user_skills");
      return next(new AppError("Failed to update skills", 500));
    }
  } catch (e) {
    console.error(e);
    return next(new AppError("Failed to update skills", 500));
  }
};
