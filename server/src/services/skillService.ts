import { eq } from "drizzle-orm";
import { Skill, SkillCategory, User, UserSkill } from "../drizzle/schema.ts";
import { db } from "../drizzle/db.ts";

export const getUserSkills = async (id: string) => {
  const skills = await db
    .select({
      id: UserSkill.id,
      skill_name: Skill.skill_name,
      category: SkillCategory.category_name,
      type: UserSkill.type, //offering or wanting
    })
    .from(UserSkill)
    .innerJoin(Skill, eq(UserSkill.skill_id, Skill.id))
    .innerJoin(SkillCategory, eq(Skill.category_id, SkillCategory.id))
    .where(eq(UserSkill.user_id, id));

  return skills;
};

// find if a skill exists in skills table (not to confuse user_skills)
export const findOneSkill = async (skillName: string) => {
  const skill = await db
    .select()
    .from(Skill)
    .where(eq(Skill.skill_name, skillName));
  if (skill.length > 0) {
    return skill[0];
  } else {
    return false;
  }
};

export const addOneSkill = async (skillName: string, categoryId: string) => {
  const newSkill = await db
    .insert(Skill)
    .values({
      skill_name: skillName,
      category_id: categoryId,
    })
    .returning({ id: Skill.id, skillName: Skill.skill_name });
  return newSkill[0]?.id;
};

export const addNewUserSkill = async (
  skillId: string,
  userId: string,
  type: "offering" | "wanting"
) => {
  const newUserSkill = await db
    .insert(UserSkill)
    .values({
      user_id: userId,
      skill_id: skillId,
      type,
    })
    .returning({ id: UserSkill.id });
  return newUserSkill[0];
};
