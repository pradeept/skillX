// notificationSocket.js
import { Server } from "socket.io";
import { getRedisClient } from "../redis/redis.ts";
import type http from "http";
import type { RequestHandler } from "express";
import { verifyToken } from "../../utils/jwt.ts";

export default async function notificationSocket(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>
) {
  const redis = await getRedisClient();

  // initialize
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  console.log("✅ Socket.io server initialized");

  // namespace for notifications
  const notificationNamespace = io.of("/api/notification");

  notificationNamespace.on("connection", async (socket) => {
    const userId = socket.handshake.query.userId;
    const token = socket.handshake.headers.authorization;

    if (!userId || !token || !verifyToken(token)?.split(" ")[1]) {
      console.log(
        "❌ Invalid userId or Authorization token — disconnecting socket"
      );
      socket.disconnect(true);
      return;
    }

    console.log(`✅ User ${userId} connected [socket:${socket.id}]`);

    // set user as online in redis
    await redis?.SET(`user:${userId}`, "true");

    // join a private room for targeted notifications
    socket.join(`user:${userId}`);

    // handle disconnection and status updation
    socket.on("disconnect", async () => {
      console.log(`User ${userId} disconnected`);
      await redis.del(`user:${userId}`);
    });
  });

  const notify = async (userId: string, message: string) => {
    notificationNamespace.to(`user:${userId}`).emit("notification", message);
    return true;
  };

  // return middleware-like function that adds the helper to app
  const middleware: RequestHandler = (req, res, next) => {
    (req as any).notify = notify;
    next();
  };

  return middleware;
}
