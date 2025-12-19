// socket has been added to track user online status
// if online send directly through socket and store in db with read:true

import { getRedisClient } from "../../configs/redis/redis.ts";
import { db } from "../../db/drizzle/db.ts";
import { Notifications } from "../../db/drizzle/schema.ts";
import { desc, eq } from "drizzle-orm";
import type { NotificationType } from "../../types/notification.js";
import { AppError } from "../../utils/AppError.ts";

// else store in db as a col and read:false;
// In this class handle global notifications operations
// 1. when the user create a session_request
//2. when user gets coins credited or debited
//3. before 15 minutes to join the session video conference
// 4. after completion of session for review.
export const createNotification = async function (
  notify: (userId: string, newNotification: NotificationType) => boolean,
  userId: string,
  message: string,
) {
  const redis = await getRedisClient();
  const isUserOnline = await redis.get(`user:${userId}`);
  const newNotification = await db
    .insert(Notifications)
    .values({
      user_id: userId,
      message,
      read: isUserOnline ? true : false,
    })
    .returning({
      id: Notifications.id,
      message: Notifications.message,
      read: Notifications.read,
      createdAt: Notifications.created_at,
    });
  if (isUserOnline && newNotification[0]) {
    notify(userId, newNotification[0]);
  }
  return newNotification[0];
};

const getOneNotification = async (notificationId: string) => {
  const isExists = await db
    .select()
    .from(Notifications)
    .where(eq(Notifications.id, notificationId));
  return isExists[0];
};

export const fetchTopNotifications = async (userId: string) => {
  const notifications = await db
    .select({
      id: Notifications.id,
      message: Notifications.message,
      read: Notifications.read,
      createdAt: Notifications.created_at,
    })
    .from(Notifications)
    .where(eq(Notifications.user_id, userId))
    .orderBy(desc(Notifications.created_at))
    .limit(10);

  return notifications;
};

export const updateNotification = async (id: string) => {
  // Business rules
  // 1. check if notification exists
  const isExists = getOneNotification(id);

  if (!isExists) {
    return new AppError("Invalid notification id", 400);
  }
  const updated = await db
    .update(Notifications)
    .set({ read: true })
    .where(eq(Notifications.id, id))
    .returning();

  return updated[0];
};
