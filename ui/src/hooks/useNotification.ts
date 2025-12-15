"use client";

import useUserStore from "@/store/userStore";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_HOST}/notification`;

export const useNotificationSocket = (
  onNotification?: (message: string) => void,
) => {
  const socketRef = useRef<Socket | null>(null);
  const userId = useUserStore((state) => state.userInfo?.userId);

  console.log(userId);

  useEffect(() => {
    if (!SOCKET_URL) {
      console.log("[client] notification socket failed to connect");
      return;
    }

    // create socket only once
    socketRef.current = io(SOCKET_URL, {
      withCredentials: true,
      auth: {
        userId,
      },
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("[client] Notification socket connected");
    });

    socket.on("notification", (message: string) => {
      onNotification?.(message);
    });

    socket.on("disconnect", (reason) => {
      console.log("[client] Notification socket disconnected:", reason);
    });

    socket.on("error", (res) => {
      console.error(res.message);
    });

    socket.on("connect_error", (err) => {
      console.error(
        "[client] Notification socket connection error:",
        err.message,
      );
    });

    return () => {
      socket.off("notification");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [onNotification]);

  return socketRef;
};
