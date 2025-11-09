import { type NextFunction, type Request, type Response } from "express";
import { AppError } from "../utils/AppError.ts";
import {
  deleteUserAccount,
  findUserById,
  getUserDetails,
  updateUserDetails,
} from "../services/profileService.ts";
import {
  deleteProfileSchema,
  updateProfileSchema,
} from "../validators/profile.schema.ts";
import type { UserType } from "../types/schema.types.ts";
import z from "zod";

/*
    @Params: id
    @Params: email
    from isAuthorized middleware
*/
export const getProfile = async (
  req: Request & { data?: any },
  res: Response,
  next: NextFunction
) => {
  const data = req.data;
  const email = data.email;
  const user = await getUserDetails(email);

  if (!user) {
    return next(new AppError("User not found", 404));
  } else {
    return res.status(200).json({
      status: "success",
      user: {
        email: user.email,
        full_name: user.full_name,
        bio: user.bio,
        avatar_url: user.avatar_url,
        total_lessons_learned: user.total_lessons_learned,
        total_lessons_taught: user.total_lessons_taught,
        points: user.points,
        level: user.level,
      },
    });
  }
};

export const updateProfile = async (
  req: Request & { data?: any },
  res: Response,
  next: NextFunction
) => {
  const data = req.data;

  //zod validation
  const validatedBody = updateProfileSchema.parse(data);

  const isUserExist = await findUserById(data.id);

  if (!isUserExist) {
    return next(new AppError("User not found", 404));
  } else {
    const updatedUser = await updateUserDetails({
      id: validatedBody.id,
      full_name: validatedBody.fullName,
      bio: validatedBody.bio,
      avatar_url: validatedBody.avatarUrl,
    });
    if (updatedUser) {
      return res.status(200).json({
        status: "success",
        message: "Profile updated successfully",
      });
    }
  }
};

export const deleteProfile = async (
  req: Request & { data?: any },
  res: Response
) => {
  const data = req.data;
  const validatedBody = deleteProfileSchema.parse(data);

  const deletedUser = await deleteUserAccount(validatedBody.id);
  if (deletedUser) {
    // Invalidate Token (require architecture change)
    return res.status(200).json({
      status: "success",
      message: "Profile deleted successfully",
    });
  }
};
