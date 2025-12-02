import { eq } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import { VideoMeet } from "../../db/drizzle/schema.ts";
import { AppError } from "../../utils/AppError.ts";
import { findOneSession } from "../session/session.service.ts";

export const findOneVideoMeet = async (id: string) => {
  const meet = await db.select().from(VideoMeet).where(eq(VideoMeet.id, id));
  if (meet[0]) {
    return meet[0];
  } else {
    return null;
  }
};

export const createVideoMeet = async (sessionId: string) => {
  // business rules
  // 1. check if sessionId exists
  const session = await findOneSession(sessionId);
  if (!session) throw new AppError("Invalid session id", 400);

  // 2. check if session starts in 5 mins
  const schedule = new Date(session.scheduled_datetime);
  const isValidSchedule = isWithinFiveMinutes(schedule);

  if (!isValidSchedule) {
    throw new AppError(
      "Session does not start in 5 minutes, please try after sometime.",
      404,
    );
  }

  const newVideo = await db
    .insert(VideoMeet)
    .values({
      participant_one: session.learner_id,
      participant_two: session.teacher_id,
    })
    .returning();
  return newVideo[0];
};

// when the participants connect through
// socket + webrtc update the record
export const updateVideoMeet = async (id: string) => {};

// helper
const isWithinFiveMinutes = (date: Date): boolean => {
  const now = Date.now();
  const diff = date.getTime() - now;

  return diff >= 0 && diff <= 5 * 60 * 1000; // 5 minutes in ms
};
