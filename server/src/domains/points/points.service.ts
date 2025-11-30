// credit points to a user
// create a transaction record in point_transaction

import { eq, sql } from "drizzle-orm";
import { db } from "../../db/drizzle/db.ts";
import { PointsTransaction, User } from "../../db/drizzle/schema.ts";

/*
    - for completing a session as a teacher
    - for adding a review
    - (future) buying points
*/
// helper service - called by sessionService
export const creditPoints = async (
  userId: string,
  pointsVal: number,
  reason: "session_completed" | "signup_bonus" | "review_given"
) => {
  const creditPointsTx = await db.transaction(async (tx) => {
    const newPointTransaction = await tx
      .insert(PointsTransaction)
      .values({
        user_id: userId,
        amount: pointsVal,
        reason,
        transaction_type: "credit",
      })
      .returning();

    if (!newPointTransaction[0]) {
      tx.rollback();
    }
    const updatedUserPoints = await tx
      .update(User)
      .set({ points: sql`${User.points}+${pointsVal}` })
      .where(eq(User.id, userId))
      .returning();
    if (!updatedUserPoints[0]) {
      tx.rollback();
    }
    return {
      pointsTransaction: newPointTransaction[0],
      updatedUser: updatedUserPoints[0],
    };
  });
  return creditPoints;
};

// debit points from a user
// create a transaction record in point_transaction

/*
    - for cancelling a scheduled session
    - for completing a session as a learner
    - for no_show for a session
    - on session creation (to avoid below problem)
*/

export const debitPoints = async (
  userId: string,
  pointsVal: number,
  reason: "session_requested" | "session_cancelled" | "no_show"
) => {
  const debitPointsTx = await db.transaction(async (tx) => {
    const newPointTransaction = await tx
      .insert(PointsTransaction)
      .values({
        user_id: userId,
        amount: pointsVal,
        reason,
        transaction_type: "debit",
      })
      .returning();

    if (!newPointTransaction[0]) {
      tx.rollback();
    }
    const updatedUserPoints = await tx
      .update(User)
      .set({ points: sql`${User.points} - ${pointsVal}` })
      .where(eq(User.id, userId))
      .returning();
    if (!updatedUserPoints[0]) {
      tx.rollback();
    }
    return {
      pointsTransaction: newPointTransaction[0],
      updatedUser: updatedUserPoints[0],
    };
  });
  return debitPointsTx;
};



// refund
/*
    - called by session Request status update service if the 
      provider declines
    - 
*/
export const refundPoints = async()=>{
    
}

/*
(optional -  if points deduct after completion of a session,
    but this will create a situation where
    user can create multiple sessions before getting completed..
)
    - when somebody creates a session and 
    cancels it before the provider accepts it
*/
