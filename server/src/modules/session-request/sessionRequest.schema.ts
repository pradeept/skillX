import z from "zod";

export const sessionRequestValidation = z.object({
  id: z.uuid("id is required").min(36).max(36),
  providerId: z.uuid("provider id is required").min(36).max(36),
  schedule: z.iso
    .datetime("schedule is required")
    .transform((val) => new Date(val)),
  skillId: z.uuid("skill id is required").min(36).max(36),
});
