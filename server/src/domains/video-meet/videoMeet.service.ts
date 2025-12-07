import { eq, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import { VideoMeet } from "../../db/drizzle/schema.ts";
import { AppError } from "../../utils/AppError.ts";
import { findOneSession } from "../session/session.service.ts";
import { SocketError } from "../../utils/SocketError.ts";

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

  // 2. check if session has scheduled status
  if (session.session_status !== "scheduled")
    new AppError("Invalid sessionId", 400);

  // 3. check if there is a record with same session id
  const isDuplicateSession = await db
    .select()
    .from(VideoMeet)
    .where(eq(VideoMeet.session, sessionId));

  if (isDuplicateSession[0]) {
    return isDuplicateSession[0];
  }
  // 4. check if session starts in 5 mins
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
      session: sessionId,
    })
    .returning();
  return newVideo[0];
};

// used by video socket to update participant attendendance.
export const updateVideoMeet = async (id: string, userId: string) => {
  // business rules
  // 1. Is meetid exists
  const videoMeet = await db
    .select()
    .from(VideoMeet)
    .where(eq(VideoMeet.id, id));

  if (!videoMeet[0]) {
    throw new SocketError("Invalid video id", 400);
    return;
  }
  //2. check if userId exists for that videoMeet
  const participantOne = videoMeet[0].participant_one;
  const participantTwo = videoMeet[0].participant_two;

  if (userId !== participantOne || userId !== participantTwo) {
    throw new SocketError("User is not authorized to perform this action", 403);
    return;
  }

  let updatedVideoMeet;
  if (userId === participantOne) {
    updatedVideoMeet = await db
      .update(VideoMeet)
      .set({ isParticipantOneAttended: true, updated_at: sql`now` })
      .where(eq(VideoMeet.id, id))
      .returning();
  } else {
    updatedVideoMeet = await db
      .update(VideoMeet)
      .set({ isParticipantOneAttended: true, updated_at: sql`now` })
      .where(eq(VideoMeet.id, id))
      .returning();
  }

  if (!updatedVideoMeet[0]) {
    throw new SocketError("Failed to update video meet attendance", 500);
    return;
  }
  return updatedVideoMeet[0];
};

// helper
const isWithinFiveMinutes = (scheduledDateTime: Date): boolean => {
  const now = Date.now();
  const curDate = new Date(now);
  console.log(scheduledDateTime);
  console.log(curDate);
  const diffMs = scheduledDateTime.getTime() - curDate.getTime();
  const diffMinutes = diffMs / 1000 / 60;

  if (diffMinutes <= 5 && diffMinutes > 0) {
    return true;
  } else {
    return false;
  }
};
