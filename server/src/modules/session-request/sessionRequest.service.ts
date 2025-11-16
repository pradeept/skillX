import { eq, or, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import {
  Review,
  Session,
  SessionRequest,
  Skill,
  User,
} from "../../db/drizzle/schema.ts";
import { alias } from "drizzle-orm/pg-core";

// UPDATE THIS
export const findAllSessionRequests  = async (userId: string) => {
  //aliases for tables
  // provider => teacher
  // requester => student
  const provider = alias(User, "provider");
  const requester = alias(User, "requester");

  const sessions = await db.transaction(async (tx) => {
    const sessionRequests = await tx
      .select({
        id: SessionRequest.id,
        skill: Skill.skill_name,
        requester: requester.full_name,
        requesterId: requester.id,
        provider: provider.full_name,
        providerId: provider.id,
        status: SessionRequest.status,
        schedule: SessionRequest.proposed_datetime,
      })
      .from(SessionRequest)
      .where(
        or(
          eq(SessionRequest.requester_id, userId),
          eq(SessionRequest.provider_id, userId)
        )
      )
      .leftJoin(provider, eq(SessionRequest.provider_id, provider.id))
      .leftJoin(requester, eq(SessionRequest.requester_id, requester.id))
      .leftJoin(Skill, eq(SessionRequest.skill_id, Skill.id));

    const pastSessions = await tx
      .select({
        id: Session.id,
        schedule: Session.completed_at,
        teacher: provider.full_name,
        teacherId: provider.id,
        student: requester.full_name,
        studentId: requester.id,
      })
      .from(Session)
      .where(eq(Session.learner_id, userId))
      .leftJoin(provider, eq(provider.id, User.id))
      .leftJoin(requester, eq(requester.id, User.id));

    return {
      sessionRequests,
      pastSessions,
    };
  });
  return sessions;
};

export const findOneSession = async (sessionId: string) => {
  const session = await db.transaction(async (tx) => {
    const provider = alias(User, "provider");
    const requester = alias(User, "requester");

    const sessionDetails = await tx
      .select({
        id: SessionRequest.id,
        // title: SessionRequest.title,
        // description: SessionRequest.description,
        skill: Skill.skill_name,
        requester: requester.full_name,
        requesterId: requester.id,
        provider: provider.full_name,
        providerId: provider.id,
        status: SessionRequest.status,
        schedule: SessionRequest.proposed_datetime,
      })
      .from(Session)
      .where(eq(Session.id, sessionId))
      .leftJoin(User, eq(Session.teacher_id, provider.id))
      .leftJoin(User, eq(Session.learner_id, requester.id));

    const reviews = await tx
      .select()
      .from(Review)
      .where(eq(Review.session_id, sessionId));

    return { sessionDetails: sessionDetails[0], reviews };
  });
  return session;
};

export const insertSessionRequest = async (data: {
  requesterId: string;
  providerId: string;
  schedule: Date;
  skillId: string;
}) => {
  const { requesterId, providerId, schedule, skillId } = data;

  const newSessionRequest = await db
    .insert(SessionRequest)
    .values({
      requester_id: requesterId,
      provider_id: providerId,
      proposed_datetime: schedule,
      skill_id: skillId,
      created_at: sql`now()`,
      updated_at: sql`now()`,
    })
    .returning();

  return newSessionRequest;
};

export const updateSessionRequestStatus = async (data: {
  id: string;
  status: "accepted" | "declined" | "cancelled";
}) => {
  const { id, status } = data;
  if (status === "declined" || status === "cancelled") {
    const updatedSessionRequest = await db
      .update(SessionRequest)
      .set({
        status,
        updated_at: sql`now()`,
      })
      .where(eq(SessionRequest.id, id))
      .returning();
    return updatedSessionRequest[0];
  } else {
    const sessionRequestUpdate = await db.transaction(async (tx) => {
      const txOne = await tx
        .update(SessionRequest)
        .set({
          status,
          updated_at: sql`now()`,
        })
        .where(eq(SessionRequest.id, id))
        .returning();
      if (txOne.length > 0 && txOne[0]) {
        const newSession = await tx
          .insert(Session)
          .values({
            request_id: txOne[0].id,
            teacher_id: txOne[0].provider_id,
            learner_id: txOne[0].requester_id,
            skill_id: txOne[0].skill_id,
            scheduled_datetime: txOne[0].proposed_datetime,
            created_at: sql`now()`,
            updated_at: sql`now()`,
          })
          .returning();
        return txOne[0];
      } else {
        console.error("[session-service]: Failed to update session request");
        tx.rollback();
      }
    });
    return sessionRequestUpdate;
  }
};
