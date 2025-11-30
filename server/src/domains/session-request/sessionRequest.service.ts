import { eq, inArray, or, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import {
  Session,
  SessionRequest,
  Skill,
  User,
  UserSkill,
} from "../../db/drizzle/schema.ts";
import { alias } from "drizzle-orm/pg-core";
import { AppError } from "../../utils/AppError.ts";
import * as sessionService from "../session/session.service.ts";

// const DEFAULT_SESSION_DURATION_MINUTES = 60;

export const findAllSessionRequests = async (userId: string) => {
  //aliases for tables
  // provider => teacher
  // requester => student
  const provider = alias(User, "provider");
  const requester = alias(User, "requester");

  const sessionRequests = await db.transaction(async (tx) => {
    return await tx
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
  });
  return sessionRequests;
};

export const findOneSessionRequest = async (id: string) => {
  const result = await db
    .select()
    .from(SessionRequest)
    .where(eq(SessionRequest.id, id));
  if (result.length > 0) {
    return result[0];
  } else {
    return null;
  }
};

export const insertSessionRequest = async (data: {
  requesterId: string;
  providerId: string;
  schedule: Date;
  skillId: string;
}) => {
  const { requesterId, providerId, schedule, skillId } = data;

  // business rules
  // 1. is provider and requester id exists
  const isProviderAndRequesterExists = await db
    .select({ id: User.id })
    .from(User)
    .where(inArray(User.id, [requesterId, providerId]));

  if (isProviderAndRequesterExists.length !== 2) {
    throw new AppError("Invalid provider/requester id", 400);
  }

  // 2. is skill valid
  const isSkillExists = await db
    .select({ id: Skill.id })
    .from(Skill)
    .where(eq(Skill.id, skillId));

  if (isSkillExists.length !== 1) {
    throw new AppError("Invalid skill id", 400);
  }

  // 3. does provider has and offers that skill
  const providerSkills = await db
    .select()
    .from(UserSkill)
    .where(eq(UserSkill.user_id, providerId));

  const providerHasSkill = providerSkills.some(
    (skill) => skill.skill_id === skillId && skill.type === "offering"
  );

  if (!providerHasSkill) {
    throw new AppError("Provider does not offer the specified skill", 400);
  }
  // 4. check if the scheduled time is available for REQUESTER
  let hasOverlappingSession = false;
  let hasOverlappingRequest = false;

  // check for overlapping sessions for requester
  const existingSessionsRequester = await db
    .select({ id: Session.id })
    .from(Session)
    .where(
      sql`${Session.learner_id} = ${requesterId} 
      AND ${Session.session_status} = 'scheduled' 
      AND ${
        Session.scheduled_datetime
      } < ${schedule.toISOString()}::timestamp + INTERVAL '60 minutes'
      AND ${
        Session.scheduled_datetime
      } + INTERVAL '60 minutes' > ${schedule.toISOString()}::timestamp`
    );
  console.log("existing sessions (requester): ", existingSessionsRequester);
  if (existingSessionsRequester.length > 0) hasOverlappingSession = true;

  // check for overlapping requests for requester
  const existingRequestsRequester = await db
    .select({ id: SessionRequest.id })
    .from(SessionRequest)
    .where(
      sql`${SessionRequest.requester_id} = ${requesterId} AND ${
        SessionRequest.status
      } IN ('pending', 'accepted') AND ${
        SessionRequest.proposed_datetime
      } < ${schedule.toISOString()}::timestamp + INTERVAL '60 minutes' AND ${
        SessionRequest.proposed_datetime
      } + INTERVAL '60 minutes' > ${schedule.toISOString()}::timestamp`
    );
  console.log("existing requests (requester): ", existingRequestsRequester);
  if (existingRequestsRequester.length > 0) hasOverlappingRequest = true;

  // 5. check if the scheduled time is available for PROVIDER
  // check for overlapping sessions for provider
  const existingSessionsProvider = await db
    .select()
    .from(Session)
    .where(
      sql`${Session.teacher_id} = ${providerId} 
      AND ${Session.session_status} = 'scheduled' 
      AND ${
        Session.scheduled_datetime
      } < ${schedule.toISOString()}::timestamp + INTERVAL '60 minutes'
      AND ${
        Session.scheduled_datetime
      } + INTERVAL '60 minutes' > ${schedule.toISOString()}::timestamp`
    );
  console.log("existing sessions (provider): ", existingSessionsProvider);
  if (existingSessionsProvider.length > 0) hasOverlappingSession = true;

  // check for overlapping requests for provider
  const existingRequestsProvider = await db
    .select()
    .from(SessionRequest)
    .where(
      sql`${SessionRequest.provider_id} = ${providerId} 
      AND ${SessionRequest.status} IN ('pending', 'accepted')
      AND ${
        SessionRequest.proposed_datetime
      } < ${schedule.toISOString()}::timestamp + INTERVAL '60 minutes'
      AND ${
        SessionRequest.proposed_datetime
      } + INTERVAL '60 minutes' > ${schedule.toISOString()}::timestamp`
    );
  console.log("existing requests (provider): ", existingRequestsProvider);
  if (existingRequestsProvider.length > 0) hasOverlappingRequest = true;

  if (hasOverlappingSession) {
    throw new AppError("Another conflicting session exists", 400);
  }
  if (hasOverlappingRequest) {
    throw new AppError("Another conflicting request exists", 400);
  }

  // create a record
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

  return newSessionRequest[0];
};

export const updateSessionRequestStatus = async (data: {
  userId: string;
  sessionRequestId: string;
  status: "accepted" | "declined" | "cancelled";
}) => {
  const { userId, sessionRequestId, status } = data;

  // business rules
  // 1. check if request exists
  const sessionRequestExists = await findOneSessionRequest(sessionRequestId);

  if (!sessionRequestExists) {
    throw new AppError("Invalid sessionRequest id", 400);
  }

  // 2. if new status is accepted | declined - providerId should be userId
  if (status === "accepted" || status === "declined") {
    if (sessionRequestExists.provider_id !== userId) {
      throw new AppError(
        "You do not have permission to update this request",
        400
      );
    }
  }
  // 3. if new status is cancelled - requesterId should match userId
  if (status === "cancelled" && sessionRequestExists.requester_id !== userId) {
    throw new AppError(
      "You do not have permission to update this request",
      400
    );
  }
  // 4. if new status is same as old status - reject duplication
  if (status === sessionRequestExists.status) {
    throw new AppError("Duplicate request status not modified", 204);
  }

  if (status === "declined" || status === "cancelled") {
    // just update the status
    const updatedSessionRequest = await db
      .update(SessionRequest)
      .set({
        status,
        updated_at: sql`now()`,
      })
      .where(eq(SessionRequest.id, sessionRequestId))
      .returning();
    return updatedSessionRequest[0];
  } else {
    // otherwise, update the status and create a session record
    const sessionRequestUpdate = await db.transaction(async (tx) => {
      const updatedSessionRequest = await tx
        .update(SessionRequest)
        .set({
          status,
          updated_at: sql`now()`,
        })
        .where(eq(SessionRequest.id, sessionRequestId))
        .returning();
      if (updatedSessionRequest[0]) {
        const newSession = await sessionService.createSession({
          requestId: updatedSessionRequest[0].id as string,
          teacherId: updatedSessionRequest[0].provider_id as string,
          learnerId: updatedSessionRequest[0].requester_id as string,
          skillId: updatedSessionRequest[0].skill_id as string,
          schedule: updatedSessionRequest[0].proposed_datetime as Date,
        });
        if (!newSession) {
          // if new session is not created
          tx.rollback();
        }
        return updatedSessionRequest[0];
      } else {
        tx.rollback(); // will throw an error
      }
    });
    return sessionRequestUpdate;
  }
};
