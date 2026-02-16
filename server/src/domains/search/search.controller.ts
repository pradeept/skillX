import type { NextFunction, Request, Response } from "express";
import { searchByProfileSchema } from "./search.schema.ts";
import { findByName } from "./search.service.ts";
import {
  calculateOffset,
  getTotalPageCount,
  getTotalRecords,
} from "../../utils/pagination.ts";
import { AppError } from "../../utils/AppError.ts";

const PAGE_SIZE = 10;

// Let's not have filters for user search
// query: /search/profile?page=2&limit=10&q="pradeep"

// query: /search/skill?skills=node.js,express.js&type=wanted
// query: /search/skill?skills=node.js&type=providing
// query: /search/skill?skills=node.js&type=providing&filter=ratings&order=desc
export const searchByProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const params = req.query;
  const validatedData = searchByProfileSchema.parse(params);

  const totalPageCount = await getTotalPageCount(validatedData.limit);

  if (validatedData.page > totalPageCount) {
    return next(new AppError("Invalid page number", 400));
  }

  const offset = calculateOffset(validatedData.page, validatedData.limit);

  const profiles = await findByName(
    validatedData.q,
    offset,
    validatedData.page,
  );

  const totalCount = await getTotalRecords();

  return res.status(200).json({
    status: "success",
    message: {
      data: profiles,
      page: validatedData.page,
      nextPage:
        validatedData.page + 1 >= totalPageCount
          ? null
          : validatedData.page + 1,
      totalCount: totalCount,
    },
  });
};

export const searchBySkills = async (req: Request, res: Response) => {};
