import { type NextFunction, type Request, type Response } from "express";
import { AppError } from "../utils/AppError.ts";
import { loginSchema, registerSchema } from "../validators/auth.schema.ts";
import * as authService from "../services/authService.ts";
import { generateToken } from "../utils/jwt.ts";
import { comparePassword, hashPassword } from "../utils/hash.ts";

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;

  //zod validation and errors handled by global error handler
  if (!body || !body.email || !body.password) {
    return next(new AppError("email and password are required", 400));
  }

  // parse will throw a ZodError by default
  const validatedBody = loginSchema.parse(body);

  // service call
  const user = await authService.findUserByEmail(validatedBody.email);

  if (!user) {
    return next(new AppError("Invalid Email or Password", 401));
  } else {
    const {
      id,
      email,
      full_name,
      password_hash,
      bio,
      avatar_url,
      total_lessons_learned,
      total_lessons_taught,
      points,
      level,
    } = user;

    const isPasswordValid = await comparePassword(
      validatedBody.password,
      password_hash
    );

    if (isPasswordValid) {
      // generate and assign token
      const token = generateToken({
        id,
        email,
        full_name,
      });
      res.cookie("token", token, {
        maxAge: 3600000, //1hr
        sameSite: "strict",
        httpOnly: true, //only accessible by web servers
        secure: process.env.NODE_ENV === "production", //only https
      });
      return res.status(200).json({
        status: "success",
        message: "Login Successful",
        user: {
          email,
          full_name,
          bio,
          avatar_url,
          total_lessons_learned,
          total_lessons_taught,
          points,
          level,
        },
        token,
      });
    } else {
      return next(new AppError("Invalid Email or Password", 401));
    }
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body; // x-www-form-urlencoded

  //zod validation and errors handled by global error handler
  if (!body || !body.email || !body.password || !body.fullname) {
    return next(new AppError("fullname, email and password are required", 400));
  }

  // parse will throw a ZodError by default
  const validatedBody = registerSchema.parse(body);

  const password_hash = await hashPassword(validatedBody.password);
  const isUserExist = await authService.findUserByEmail(validatedBody.email);
  if (isUserExist) {
    return next(new AppError("Email already exists", 400));
  }
  const newUser = await authService.createNewUser({
    email: validatedBody.email,
    password_hash,
    full_name: validatedBody.fullname,
  });

  if (newUser) {
    return res.status(200).json({
      status: "success",
      message: "Registration successful",
    });
  }
};
