import z from "zod";

export const registerSchema = z.object({
  fullName: z
    .string("Full name is required")
    .max(20, { error: "Too long" })
    .min(3, { error: "Full name should be at least 3 characters" }),
  email: z.email("Email should be valid"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one digit")
    .regex(
      /[@#$%^&]/,
      "Password must contain at least one special character (@, #, $, %, ^, &, etc.)",
    ),
  confirmPassword: z
    .string("Confirm Password is required")
    .min(8, "Password should be minimum 8 characters")
    .max(30, "Too long"),
  bio: z.optional(z.string().max(100, "Bio is too long")),
});
