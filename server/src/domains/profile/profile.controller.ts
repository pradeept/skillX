import { type NextFunction, type Request, type Response } from "express";
import { AppError } from "../../utils/AppError.ts";
import * as profileService from "./profile.service.ts";
import { deleteProfileSchema, updateProfileSchema } from "./profile.schema.ts";
import z from "zod";

// USE PAGINATION
export const getAllProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const users = await profileService.getAllUsers();
  if (users) {
    return res.status(200).json({
      status: "success",
      users,
    });
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.data.id;

  const user = await profileService.findUserById(userId);

  if (!user) {
    return next(new AppError("User not found", 404));
  } else {
    return res.status(200).json({
      status: "success",
      user: {
        userId: user.id,
        email: user.email,
        fullName: user.full_name,
        bio: user.bio,
        avatar: user.avatar_url,
        total_lessons_learned: user.total_lessons_learned,
        total_lessons_taught: user.total_lessons_taught,
        points: user.points,
        level: user.level,
      },
    });
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const data = req.body;

  //zod validation
  const validatedBody = updateProfileSchema.parse(data);

  const isUserExist = await profileService.findUserById(data.id);

  if (!isUserExist) {
    return next(new AppError("User not found", 404));
  } else {
    const updatedUser = await profileService.updateUserDetails({
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
  res: Response,
) => {
  const data = req.data;
  const validatedBody = deleteProfileSchema.parse(data);

  const deletedUser = await profileService.deleteUserAccount(validatedBody.id);
  if (deletedUser) {
    // Invalidate Token (require architecture change)
    return res.status(200).json({
      status: "success",
      message: "Profile deleted successfully",
    });
  }
};
