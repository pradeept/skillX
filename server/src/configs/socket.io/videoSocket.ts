import type { DefaultEventsMap, Namespace, Server } from "socket.io";
import { getRedisClient } from "../redis/redis.ts";
import z from "zod";
import { verifyToken } from "../../utils/jwt.ts";
import type { RedisClientType } from "@redis/client";

/*
    adapter => in-memory
*/
export const videoNamespace = async (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) => {
  const namespace = io.of("/api/video");

  const redis = await getRedisClient();

  namespace.on("connection", async (socket) => {
    const roomId = socket.handshake.query.id as string;
    const userId = socket.handshake.query.userId as string;
    const token = socket.handshake.headers.authorization;

    // validations
    const videoSocketSchema = z.object({
      userId: z.uuid(),
      roomId: z.uuid(),
    });

    const validatedParams = videoSocketSchema.safeParse({
      userId,
      roomId,
    });
    if (!validatedParams.success || !token) {
      socket.disconnect();
      return;
    }
    const cleanToken = token.replace("Bearer ", "");
    const jwtPayload: any = verifyToken(cleanToken);

    if (!jwtPayload || jwtPayload.id !== userId) {
      socket.disconnect();
      return;
    }

    // --- check if the room exists ---
    const roomExists = namespace.adapter.rooms.get(roomId);

    /*
      - if room does not exists, join new socket to roomId
      - set in redis roomId:participants :{ userId: socket.id}
      - emit create-offer 
      - listen for offer and set it in redis 
    */
    if (!roomExists) {
      socket.join(roomId);

      await redis.hSet(`${roomId}:participants`, {
        userId: socket.id,
      });

      socket.to(socket.id).emit("create-offer");
    } else {
      /*
        - In case room already exists, check if there is old socket conn
          for current userId, if so, disconnect it from namespace, add new conn
          and update in redis.
        - Re-initiate webRTC
      */
      const oldSocket = await redis.hGet(`${roomId}:participants`, userId);
      if (oldSocket) {
        io.sockets.sockets.get(oldSocket)?.disconnect();
      }

      socket.join(roomId);

      // add/update the key value (userId: socket.id)
      await redis.hSet(`${roomId}:participants`, {
        userId: socket.id,
      });

      const participants = await redis.hGetAll(`${roomId}:participants`);
      const isRoomFull = Object.keys(participants).length === 2;

      const offer = await redis.exists(`${roomId}:offer`);
      const answer = await redis.exists(`${roomId}:answer`);

      // re-initiate the webRTC flow, bcz a socket re-connected
      // and there is OFFER and ANSWER
      if (isRoomFull && offer && answer) {
        const otherPariticipant = await getOtherParticipantUserId(
          redis,
          userId,
          roomId
        );
        if (otherPariticipant) {
          const otherParticipantSocket =
            namespace.sockets.get(otherPariticipant);
          otherParticipantSocket?.emit("re-connect");
          otherParticipantSocket?.disconnect();
        }
        socket.to(socket.id).emit("create-offer");
      } else if (offer && !answer) {
        socket.to(socket.id).emit("set-offer", offer);
      } else if (!offer && answer) {
        // answer without offer not useable
        await redis.del(`${roomId}:answer`);
      } else {
        // room exists but not full
        socket.to(socket.id).emit("create-offer");
      }
    }

    // listeners
    socket.on("offer", async (data) => {
      await redis.hSet(`${roomId}:offer`, {
        offer: data,
      });
      // notify other user
      const otherParticipantUserId = await getOtherParticipantUserId(
        redis,
        userId,
        roomId
      );
      if (otherParticipantUserId)
        namespace.sockets.get(otherParticipantUserId)?.emit("set-offer");
    });

    socket.on("answer", async (data) => {
      redis.set(`${roomId}:answer`, data);
      // notify other socket about the answer
      const otherParticipantUserId = await getOtherParticipantUserId(
        redis,
        userId,
        roomId
      );
      if (otherParticipantUserId)
        namespace.sockets.get(otherParticipantUserId)?.emit("set-answer");
    });

    socket.on("offer-set-finished", () => {
      socket.to(socket.id).emit("create-answer");
    });

    socket.on("answer-set-finished", () => {
      console.log("Both should be connected now!");
    });

    namespace.adapter.rooms.get(roomId);
    console.log("Socket id: ", socket.id);
  });
};

const getOtherParticipantUserId = async (
  redis: RedisClientType,
  currentUserId: string,
  roomId: string
) => {
  const participants = await redis.hGetAll(`${roomId}:participants`);
  if (!participants) return null;
  if (Object.keys(participants).length !== 2) return null;
  let otherPariticipant = Object.keys(participants).find(
    (key) => key !== currentUserId
  );
  return otherPariticipant;
};
