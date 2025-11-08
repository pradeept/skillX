import z from "zod";

export const updateProfileSchema = z.object({
  id: z.string({ error: "id is required" }).min(36).max(36),
  email: z.email({ message: "Provide Valid Email" }),
  full_name: z.string("fullname is required").trim().min(3).max(40),
  bio: z.string("bio is required").trim().max(400),
  avatar_url: z.string("avatar url is required").trim().max(255),
  total_lessons_learned: z.number().max(1000).optional(),
  total_lessons_taught: z.number().max(1000).optional(),
  points: z.number().max(10000).optional(),
  level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});
