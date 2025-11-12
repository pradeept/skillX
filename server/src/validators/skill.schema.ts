import z from "zod";

export const addOrUpdateSkillSchema = z.object({
  id: z.uuid("id is required").min(36).max(36),
  skills: z
    .array(
      z.object({
        skill_name: z.string("skill name is required").min(3).max(20),
        category_id: z.uuid("category id is required").min(36).max(36),
      }),
      { error: "skills parameter is required" }
    )
    .min(1, "skills can't be empty")
    .max(10, "max 10 skills allowed"),
  type: z.enum(["offering", "wanting"]),
});

