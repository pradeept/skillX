"use client";

import useNotificationStore from "@/store/notificationStore";
import useUserStore from "@/store/userStore";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_HOST}/notification`;

export const useNotificationSocket = (
  onNotification?: (message: string) => void,
) => {
  const socketRef = useRef<Socket | null>(null);
  const userId = useUserStore((state) => state.userInfo?.userId);

  const { addNotification } = useNotificationStore((state) => state);

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

    socket.on("verified", () => {
      console.log(userId);
      socket.emit("get_notifications", userId);
    });

    socket.on(
      "notification",
      (newNotification: {
        message: string;
        createdAt: Date;
        read: boolean;
        id: string;
      }) => {
        addNotification(newNotification);
      },
    );
    socket.off("top_notifications");
    socket.on("top_notifications", (notifications: []) => {
      console.log(notifications);
      notifications.forEach((notification) => {
        addNotification(notification);
      });
    });

    socket.on("disconnect", (reason) => {
      console.log("[client] Notification socket disconnected:", reason);
    });

    socket.on("error", (res) => {
      console.error(res.message);
      toast.error(`Failed to fetch notifications`);
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
