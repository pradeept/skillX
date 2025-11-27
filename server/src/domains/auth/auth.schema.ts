import * as z from "zod";

export const loginSchema = z.object({
  email: z.email({message:"Provide Valid Email"}),
  password: z
    .string()
    .trim()
    .min(8)
    .max(28)
    .regex(
      RegExp(`^(?=.*[A-Z])(?=.*[a-z])(?=.*[@#:;])[A-Za-z0-9@#:;]{8,28}$`),
      {
        message: "Password should contain [a-z,A-z,0-9,@#:;]",
      }
    ),
});

// extends loginSchema
export const registerSchema = loginSchema.extend({  
  fullname: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .transform((val) => val.replace(/[@!#$%*?&]/g, "")), // remove special characters
});
