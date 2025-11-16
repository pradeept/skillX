import z from "zod";

export const updateSessionSchema = z.object({
  sessionId: z.uuid().min(36).max(36),
  status: z.enum(["scheduled", "completed", "no_show", "cancelled"], {
    error: "invalid status type",
  }),
});
