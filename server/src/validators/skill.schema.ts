import z from "zod";

export const addSkillSchema = z.object({
  id: z.uuid("id is required").min(36).max(36),
  skills: z
    .array(
      z.object({
        skill_name: z.string("skill name is required").min(3).max(20),
        category_id: z.uuid("category id is required").min(36).max(36),
        type: z.enum(["offering", "wanting"]),
      }),
      { error: "skills are required" }
    )
    .min(1, "skills are required")
    .max(10, "max 10 skills allowed"),
  type: z.enum(["offering", "wanting"]),
});
