import { eq, or, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import { Review, Session, User } from "../../db/drizzle/schema.ts";
import { alias } from "drizzle-orm/pg-core";
import { AppError } from "../../utils/AppError.ts";

export const findAllSessions = async (userId: string) => {
  /* aliases for tables
     provider => teacher
    requester => student

    ADD PAGINATION
  */
  const provider = alias(User, "provider");
  const requester = alias(User, "requester");

  const sessions = await db
    .select({
      id: Session.id,
      schedule: Session.completed_at,
      teacher: provider.full_name,
      teacherId: provider.id,
      student: requester.full_name,
      studentId: requester.id,
    })
    .from(Session)
    .where(or(eq(Session.teacher_id, userId), eq(Session.learner_id, userId)))
    .leftJoin(provider, eq(provider.id, userId))
    .leftJoin(requester, eq(requester.id, userId));
  return sessions;
};

export const findOneSessionWithReview = async (sessionId: string) => {
  // business rules
  // 1. check if the session exists
  const isSessionExists = await findOneSession(sessionId);

  if (!isSessionExists) {
    throw new AppError("Invalid session id", 400);
  }

  // get sessions with respective reviews
  const session = await db.transaction(async (tx) => {
    const provider = alias(User, "provider");
    const requester = alias(User, "requester");

    const sessionDetails = await tx
      .select({
        id: Session.id,
        providerName: provider.full_name,
        requesterName: requester.full_name,
        schedule: Session.scheduled_datetime,
        sessionStatus: Session.session_status,
        providerLevel: provider.level,
        requesterLevel: requester.level,
      })
      .from(Session)
      .leftJoin(provider, eq(Session.teacher_id, provider.id))
      .leftJoin(requester, eq(Session.learner_id, requester.id))
      .where(eq(Session.id, sessionId));

    const reviews = await tx
      .select({})
      .from(Review)
      .where(eq(Review.session_id, sessionId));

    return { sessionDetails: sessionDetails[0], reviews };
  });
  return session;
};

// helper service
export const findOneSession = async (sessionId: string) => {
  const session = await db
    .select()
    .from(Session)
    .where(eq(Session.id, sessionId));
  return session[0];
};

// helper service - used in session-request
export const createSession = async (data: {
  requestId: string;
  teacherId: string;
  learnerId: string;
  skillId: string;
  schedule: Date;
}) => {
  const { requestId, teacherId, learnerId, skillId, schedule } = data;
  // const utcSchedule = new Date(schedule).toISOString();
  const newSession = await db
    .insert(Session)
    .values({
      request_id: requestId,
      teacher_id: teacherId,
      learner_id: learnerId,
      skill_id: skillId,
      scheduled_datetime: schedule,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .returning();
  return newSession[0];
};

export const updateSessionStatus = async (
  sessionId: string,
  status: "scheduled" | "completed" | "no_show" | "cancelled",
  userId: string,
) => {
  // business rules
  // 1. check if session exists
  const isSessionExists = await findOneSession(sessionId);

  if (!isSessionExists) {
    throw new AppError("Invalid session id", 400);
  }

  // 2. if new status is same as old status - mark duplicate
  if (isSessionExists.session_status === status) {
    throw new AppError("Duplicate request status not modified", 204);
  }

  // 3. only learner can cancel the session
  if (status === "cancelled" && isSessionExists.request_id !== userId) {
    throw new AppError("You are not authorized to perform this action", 403);
  }

  let updatedSession;

  if (status === "completed" && userId === isSessionExists.teacher_id) {
    updatedSession = await db
      .update(Session)
      .set({
        teacher_marked_complete: true,
        updated_at: sql`now()`,
      })
      .where(eq(Session.id, sessionId))
      .returning();
  } else if (status === "completed" && userId === isSessionExists.learner_id) {
    updatedSession = await db
      .update(Session)
      .set({
        learner_marked_complete: true,
        updated_at: sql`now()`,
      })
      .where(eq(Session.id, sessionId))
      .returning();
  } else {
    // status - 'no_show' | 'cancelled'
    updatedSession = await db
      .update(Session)
      .set({
        session_status: status,
        updated_at: sql`now()`,
      })
      .where(eq(Session.id, sessionId))
      .returning();
    if (status === "cancelled") {
      //DEDUCT POINTS
    }
  }

  return updatedSession[0];
};
