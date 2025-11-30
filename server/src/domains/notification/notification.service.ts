// socket has been added to track user online status
// if online send directly through socket and store in db with read:true

import type { DefaultEventsMap, Namespace } from "socket.io";
import { getRedisClient } from "../../configs/redis/redis.ts";
import { db } from "../../db/drizzle/db.ts";
import { Notifications } from "../../db/drizzle/schema.ts";

// else store in db as a col and read:false;
// In this class handle global notifications operations
// 1. when the user create a session_request
//2. when user gets coins credited or debited
//3. before 15 minutes to join the session video conference
// 4. after completion of session for review.
export const createNotification = async function (
  notify: (userId: string, message: string) => boolean,
  userId: string,
  message: string
) {
  const redis = await getRedisClient();
  const isUserOnline = await redis.get(`user:${userId}`);
  const newNotification = await db.insert(Notifications).values({
    user_id: userId,
    message,
    read: isUserOnline ? true : false,
  });
  if (isUserOnline) {
    notify(userId, message);
  }
  return newNotification;
};
