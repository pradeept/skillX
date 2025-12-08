import type { RedisClientType } from "@redis/client";
import type { DefaultEventsMap, Server } from "socket.io";
import z from "zod";
import { verifyToken } from "../../utils/jwt.ts";
import { getRedisClient } from "../redis/redis.ts";
import { updateVideoMeet } from "../../domains/video-meet/videoMeet.service.ts";
import { validateUser } from "./utils/validateUser.ts";

/*
    adapter => in-memory
*/
export const videoNamespace = async (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  const namespace = io.of("/api/video");

  const redis = await getRedisClient();

  namespace.on("connection", async (socket) => {
    const roomId = socket.handshake.query.roomId as string;
    const userId = socket.handshake.query.userId as string;
    const token = socket.handshake.headers.authorization;

    // validations
    const isUserValid = validateUser(userId, roomId, token);

    if (!isUserValid) {
      console.error("Invalid User. Socket disconnected");
      socket.disconnect();
      return;
    }
    console.log("[server] Connection recieved on namespace.");
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
        [userId]: socket.id,
      });

      await redis.expire(`${roomId}:participants`, 42000);

      socket.emit("create-offer");
    } else {
      /*
        - In case room already exists, check if there is old socket conn
          for current userId, if so, disconnect it from namespace, add new conn
          and update in redis.
      */
      const oldSocket = await redis.hGet(`${roomId}:participants`, userId);
      if (oldSocket) {
        namespace.sockets.get(oldSocket)?.disconnect();
      }

      socket.join(roomId);

      // add/update the key value (userId: socket.id)
      await redis.hSet(`${roomId}:participants`, {
        [userId]: socket.id,
      });

      const participants = await redis.hGetAll(`${roomId}:participants`);
      const isRoomFull = Object.keys(participants).length === 2;

      const offer = await redis.exists(`${roomId}:offer`);
      const answer = await redis.exists(`${roomId}:answer`);

      // if room is full and there is already offer and answer
      // then we need to re-instantiate webrtc
      if (isRoomFull && offer && answer) {
        const otherPariticipant = await getOtherParticipantUserId(
          redis,
          userId,
          roomId,
        );
        if (otherPariticipant) {
          const otherParticipantSocket =
            namespace.sockets.get(otherPariticipant);
          otherParticipantSocket?.emit("re-connect");
          otherParticipantSocket?.disconnect();
        }
        socket.emit("create-offer");
      } else if (isRoomFull && offer && !answer) {
        // no need to re-initiate webrtc
        socket.emit("set-offer", offer);
      } else if (isRoomFull && !offer && answer) {
        // answer without offer not useable
        await redis.del(`${roomId}:answer`);
      } else {
        // room exists but not full
        // precautionary del offer and answer
        await redis.del(`${roomId}:offer`);
        await redis.del(`${roomId}:answer`);

        socket.emit("create-offer");
      }
    }

    // --- listeners ---
    socket.on("offer", async (data) => {
      await redis.hSet(`${roomId}:offer`, {
        offer: data,
      });
      // notify other user
      const otherParticipantUserId = await getOtherParticipantUserId(
        redis,
        userId,
        roomId,
      );
      if (otherParticipantUserId)
        namespace.sockets.get(otherParticipantUserId)?.emit("set-offer", data);
    });

    socket.on("answer", async (data) => {
      await redis.set(`${roomId}:answer`, data);
      // notify other socket about the answer
      const otherParticipantUserId = await getOtherParticipantUserId(
        redis,
        userId,
        roomId,
      );
      if (otherParticipantUserId)
        namespace.sockets.get(otherParticipantUserId)?.emit("set-answer", data);
    });

    socket.on("offer-set-finished", () => {
      socket.emit("create-answer");
    });

    socket.on("answer-set-finished", () => {
      console.log("Both should be connected now!");
    });
  });
};

const getOtherParticipantUserId = async (
  redis: RedisClientType,
  currentUserId: string,
  roomId: string,
) => {
  const participants = await redis.hGetAll(`${roomId}:participants`);
  if (!participants) return null;
  if (Object.keys(participants).length !== 2) return null;
  let otherUserId = Object.keys(participants).find(
    (key) => key !== currentUserId,
  );
  return otherUserId;
};
