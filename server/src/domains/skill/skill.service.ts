import { eq, inArray } from "drizzle-orm";
import {
  Skill,
  SkillCategory,
  User,
  UserSkill,
} from "../../db/drizzle/schema.ts";
import { db } from "../../db/drizzle/db.ts";

export const getUserSkills = async (id: string) => {
  const skills = await db
    .select({
      id: UserSkill.id,
      skillName: Skill.skill_name,
      category: SkillCategory.category_name,
      type: UserSkill.type, //offering or wanting
    })
    .from(UserSkill)
    .innerJoin(Skill, eq(UserSkill.skill_id, Skill.id))
    .innerJoin(SkillCategory, eq(Skill.category_id, SkillCategory.id))
    .where(eq(UserSkill.user_id, id));

  return skills;
};

export const fetchAllCategories = async () => {
  const categories = await db
    .select({ id: SkillCategory.id, categoryName: SkillCategory.category_name })
    .from(SkillCategory);

  return categories;
};

// find if a skill exists in skills table (not to confuse user_skills)
export const findSkills = async (skills: string[]) => {
  const existingSkills = await db.transaction(async (tx) => {
    return await tx
      .select()
      .from(Skill)
      .where(inArray(Skill.skill_name, skills));
  });
  return existingSkills;
};

export const addNewSkills = async (
  skills: {
    user_id: string;
    skill_name: string;
    category_id: string;
  }[],
) => {
  const newSkills = await db.transaction(async (tx) => {
    return await tx.insert(Skill).values(skills).returning();
  });
  return newSkills;
};

export const addNewUserSkill = async (
  newUserSkills: {
    user_id: string;
    skill_id: string;
    type: "offering" | "wanting";
  }[],
) => {
  return await db.transaction(async (tx) => {
    return await tx
      .insert(UserSkill)
      .values(newUserSkills)
      .onConflictDoNothing()
      .returning();
  });
};
