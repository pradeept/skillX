import { Server } from "socket.io";
import { getRedisClient } from "../redis/redis.ts";
import type http from "http";
import type { RequestHandler } from "express";
import { verifyToken } from "../../utils/jwt.ts";
import { videoNamespace } from "./videoSocket.ts";
import cookie from "cookie";

export default async function notificationSocket(
  server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>,
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

  //  video namespace for handling video conf and webRTC
  videoNamespace(io);

  // handle connection

  notificationNamespace.on("connection", async (socket) => {
    const { userId } = socket.handshake.auth;
    const rawCookie = socket.handshake.headers.cookie;
    if (!rawCookie) {
      console.log("Cookie not provided,disconnecting the connection");
      socket.emit("error", {
        message: "Cookie not provided, please login",
      });
      socket.disconnect(true);
      return;
    }
    const cookies = cookie.parse(rawCookie);

    // decode using cookie package
    let token = cookies.token;

    if (token) {
      token = decodeURIComponent(token);
    }

    console.log("userId: ", userId);
    console.log("token: ", token);
    if (!token) {
      console.log("❌ Token not provided,disconnecting the connection");
      socket.emit("error", {
        message: "Auth not provided, please login",
      });
      socket.disconnect(true);
      return;
    }

    const cleanToken = token.replace("Bearer ", "");
    if (!userId || !cleanToken || !verifyToken(cleanToken)) {
      console.log(
        "❌ Invalid userId or Authorization token — disconnecting socket",
      );
      socket.emit("error", {
        message: "Invalid userId socket disconnected",
      });
      socket.disconnect(true);
      return;
    }

    console.log(`✅ User ${userId} connected [socket:${socket.id}]`);

    // set user as online in redis
    await redis.set(`user:${userId}`, "true");

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

export { videoNamespace };
