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