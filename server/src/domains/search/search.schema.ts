import z from "zod";

export const searchByProfileSchema = z.object({
  q: z
    .string({ error: "q is required" })
    .min(3, { error: "search string should have minimum 3 characters" })
    .max(15, { error: "search string should not exceed 15 characters" }),
  page: z.string().transform((val) => {
    const page = parseInt(val);
    if (!page || page < 1) {
      return 1;
    } else {
      return page;
    }
  }),
  limit: z.string().transform((val) => {
    const page = parseInt(val);
    if (!page || page < 1) {
      return 10;
    } else {
      return page;
    }
  }),
});
