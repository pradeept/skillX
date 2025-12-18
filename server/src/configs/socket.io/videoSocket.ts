import type { RedisClientType } from "redis";
import type { DefaultEventsMap, Server } from "socket.io";
import { getRedisClient } from "../redis/redis.ts";
import { validateUser } from "./utils/validateUser.ts";

export const videoNamespace = async (
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>,
) => {
  const namespace = io.of("/api/video");
  const redis = await getRedisClient();

  namespace.on("connection", async (socket) => {
    const roomId = socket.handshake.query.roomId as string;
    const userId = socket.handshake.query.userId as string;
    const token = socket.handshake.headers.authorization;

    // 1. Validation
    const isUserValid = validateUser(userId, roomId, token);
    if (!isUserValid) {
      console.error(`[Server] Invalid User ${userId}. Disconnecting.`);
      socket.emit("error", "Invalid Credentials");
      socket.disconnect();
      return;
    }

    console.log(`[Server] User ${userId} connected to room ${roomId}`);

    // 2. Handle Connection / Reconnection
    // Check if room exists in Redis (using the participants hash as the source of truth)
    const participantsKey = `${roomId}:participants`;
    const offerKey = `${roomId}:offer`;
    const answerKey = `${roomId}:answer`;

    // Remove any old socket for this specific user (handle page refresh)
    const oldSocketId = await redis.hGet(participantsKey, userId);
    if (oldSocketId) {
      const oldSocket = namespace.sockets.get(oldSocketId);
      if (oldSocket) oldSocket.disconnect();
    }

    // Join the Socket.io room
    socket.join(roomId);

    // Register new socket in Redis
    await redis.hSet(participantsKey, userId, socket.id);
    await redis.expire(participantsKey, 3600); // 1 hour expiry

    // 3. Determine Role (Offerer vs Answerer)
    const participants = await redis.hGetAll(participantsKey);
    const participantCount = Object.keys(participants).length;

    if (participantCount === 1) {
      // First user: Needs to create the offer
      console.log(
        `[Server] User ${userId} is the first participant. Requesting Offer.`,
      );

      // Clean up any stale signaling data from previous sessions
      await redis.del(offerKey);
      await redis.del(answerKey);

      socket.emit("create-offer");
    } else {
      // Second user: Check if there is an existing offer to consume
      console.log(`[Server] User ${userId} joined as second participant.`);

      const existingOffer = await redis.get(offerKey);

      if (existingOffer) {
        console.log(`[Server] Sending existing offer to User ${userId}`);
        // Send the actual SDP data, not the existence boolean
        socket.emit("set-offer", JSON.parse(existingOffer));
      } else {
        // Edge case: 2nd user joined, but 1st user hasn't created offer yet.
        // Do nothing. The 1st user will emit 'offer' soon, which we handle below.
      }
    }

    // --- EVENT LISTENERS ---

    // A. Handle Offer
    socket.on("offer", async (data) => {
      console.log(`[Server] Received Offer from ${userId}`);
      // Store as string
      await redis.set(offerKey, JSON.stringify(data));
      await redis.expire(offerKey, 3600);

      // Relay to the other person
      const otherSocketId = await getOtherParticipantSocketId(
        redis,
        userId,
        roomId,
      );
      if (otherSocketId) {
        namespace.to(otherSocketId).emit("set-offer", data);
      }
    });

    // B. Handle Answer
    socket.on("answer", async (data) => {
      console.log(`[Server] Received Answer from ${userId}`);
      await redis.set(answerKey, JSON.stringify(data));
      await redis.expire(answerKey, 3600);

      // Relay to the other person
      const otherSocketId = await getOtherParticipantSocketId(
        redis,
        userId,
        roomId,
      );
      if (otherSocketId) {
        namespace.to(otherSocketId).emit("set-answer", data);
      }
    });

    // C. Handle ICE Candidates (CRITICAL MISSING FEATURE ADDED)
    socket.on("ice-candidate", async (candidate) => {
      // console.log(`[Server] Relay ICE Candidate from ${userId}`);
      const otherSocketId = await getOtherParticipantSocketId(
        redis,
        userId,
        roomId,
      );
      if (otherSocketId) {
        namespace.to(otherSocketId).emit("ice-candidate", candidate);
      }
    });

    // D. Signaling Steps
    socket.on("offer-set-finished", () => {
      // The client has set the REMOTE description (Offer). Now they must create an Answer.
      socket.emit(
        "create-answer" /* pass offer if needed, but client usually has it in state */,
      );
    });

    socket.on("answer-set-finished", () => {
      console.log("[Server] WEBRTC Connection Sequence Finished.");
    });

    // E. Disconnect Cleanup
    socket.on("disconnect", async () => {
      console.log(`[Server] User ${userId} disconnected`);
      // Optional: Remove from redis immediately or let it expire?
      // Usually better to keep it briefly in case of quick refresh,
      // but strictly following your logic, we might want to notify the peer.
      const otherSocketId = await getOtherParticipantSocketId(
        redis,
        userId,
        roomId,
      );
      if (otherSocketId) {
        // Optional: Notify peer that user left
        // namespace.to(otherSocketId).emit("peer-disconnected");
      }
    });
  });
};

/**
 * Helper: Gets the Socket ID of the OTHER participant in the room.
 */
const getOtherParticipantSocketId = async (
  redis: RedisClientType,
  currentUserId: string,
  roomId: string,
) => {
  const participants = await redis.hGetAll(`${roomId}:participants`);
  if (!participants) return null;

  // Find the entry where the Key (UserId) is NOT the currentUserId
  const otherUserEntry = Object.entries(participants).find(
    ([uid, _socketId]) => uid !== currentUserId,
  );

  // Return the Value (SocketId)
  return otherUserEntry ? otherUserEntry[1] : null;
};
