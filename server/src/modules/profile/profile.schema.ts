import z from "zod";

export const updateProfileSchema = z.object({
  id: z
    .string("id is required")
    .min(36, { error: "id should be 36 characters" })
    .max(36, { error: "id should be 36 characters" }), // uuid is of length 36 - always
  email: z.email({ message: "provide a valid email id" }),
  fullName: z.string("provide a valid fullname").trim().min(3).max(40),
  bio: z.string("provide a valid bio").trim().max(400),
  avatarUrl: z.string('provide a valid url for avatar').url("provide a valid url").trim().max(255),
  // total_lessons_learned: z.number().max(1000).optional(),
  // total_lessons_taught: z.number().max(1000).optional(),
  // points: z.number().max(10000).optional(),
  // level: z.enum(["beginner", "intermediate", "advanced", "expert"]),
});

export const deleteProfileSchema = z.object({
  id: z.string("id is required").min(36).max(36),
});
