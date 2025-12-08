import z from "zod";
import { verifyToken } from "../../../utils/jwt.ts";

export const validateUser = (
  userId: string,
  roomId: string,
  token: string | undefined,
): boolean => {
  const videoSocketSchema = z.object({
    userId: z.uuid(),
    roomId: z.uuid(),
  });

  const validatedParams = videoSocketSchema.safeParse({
    userId,
    roomId,
  });
  if (!validatedParams.success || !token) {
    return false;
  }
  const cleanToken = token.replace("Bearer ", "");
  const jwtPayload: any = verifyToken(cleanToken);

  if (!jwtPayload || jwtPayload.id !== userId) {
    return false;
  }

  return true;
};
