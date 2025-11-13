// socket has been added to track user online status
// if online send directly through socket and store in db with read:true

import type { DefaultEventsMap, Namespace } from "socket.io";

// else store in db as a col and read:false;
export class NotificationService {
  // In this class handle global notifications operations
  // 1. when the user create a session_request
  //2. when user gets coins credited or debited
  //3. before 15 minutes to join the session video conference
  // 4. after completion of session for review.
  pushToUser(
    notificationNamespace: Namespace<
      DefaultEventsMap,
      DefaultEventsMap,
      DefaultEventsMap,
      any
    >,
    userId: string,
    message: string
  ) {
    notificationNamespace.to(`user:${userId}`).emit("notification", message);
  }
}
