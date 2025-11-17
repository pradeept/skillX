import { eq, or, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import {
  Review,
  Session,
  User,
} from "../../db/drizzle/schema.ts";
import { alias } from "drizzle-orm/pg-core";

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
    .leftJoin(provider, eq(provider.id, User.id))
    .leftJoin(requester, eq(requester.id, User.id));
  return sessions;
};

export const findOneSessionWithReview = async (sessionId: string) => {
  const session = await db.transaction(async (tx) => {
    const provider = alias(User, "provider");
    const requester = alias(User, "requester");

    const sessionDetails = await tx
      .select()
      .from(Session)
      .leftJoin(provider, eq(Session.teacher_id, provider.id))
      .leftJoin(requester, eq(Session.learner_id, requester.id))
      .where(eq(Session.id, sessionId))

    const reviews = await tx
      .select()
      .from(Review)
      .where(eq(Review.session_id, sessionId));

    return { sessionDetails: sessionDetails[0], reviews };
  });
  return session;
};

export const findOneSession = async (sessionId: string) => {
  const session = await db
    .select()
    .from(Session)
    .where(eq(Session.id, sessionId));
  return session[0];
};

// VERIFY THIS - used in sesionRequest
export const createSession = async (data: {
  requestId: string;
  teacherId: string;
  learnerId: string;
  skillId: string;
  schedule: Date;
}) => {
  const { requestId, teacherId, learnerId, skillId, schedule } = data;
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
  data: {
    sessionId: string;
    status: "scheduled" | "completed" | "no_show" | "cancelled";
  },
  markedBy: "teacher" | "learner" | undefined
) => {
  const { sessionId, status } = data;
  let updatedSession;
  if (markedBy === "teacher") {
    updatedSession = await db
      .update(Session)
      .set({
        teacher_marked_complete: true,
        updated_at: sql`now()`,
      })
      .where(eq(Session.id, sessionId))
      .returning();
  } else if (markedBy === "learner") {
    updatedSession = await db
      .update(Session)
      .set({
        learner_marked_complete: true,
        updated_at: sql`now()`,
      })
      .where(eq(Session.id, sessionId))
      .returning();
  } else {
    // status - 'no_show' | 'cancelled' | 'completed'(marked by both)
    updatedSession = await db
      .update(Session)
      .set({
        session_status: status,
        updated_at: sql`now()`,
      })
      .where(eq(Session.id, sessionId))
      .returning();
  }

  return updatedSession[0];
};
