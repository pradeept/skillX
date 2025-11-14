import z from "zod";

export const sessionRequestValidation = z.object({
  id: z.uuid("id is required").min(36).max(36),
  title: z.string("title is required").min(3).max(50),
  description: z.string("description is required").min(3).max(255),
  providerId: z.uuid("provider id is required").min(36).max(36),
  schedule: z.date("schedule is required"),
  skillId: z.uuid("skill id is required").min(36).max(36),
});
