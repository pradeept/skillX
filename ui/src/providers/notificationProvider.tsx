"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import useUserStore from "@/store/userStore";
import useNotificationStore from "@/store/notificationStore";
import { toast } from "sonner";
import { Notification } from "@/types/notification";

const NotificationContext = createContext<Socket | null>(null);

export const NotificationProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const userId = useUserStore((state) => state.userInfo?.userId);
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    // 1. Guard: Don't connect if no user or if already connected
    if (!userId || socket?.connected) return;

    const socketInstance = io(`${process.env.NEXT_PUBLIC_HOST}/notification`, {
      withCredentials: true,
      auth: { userId },
      transports: ["websocket"], // Forces WebSocket to avoid polling-to-websocket upgrade cycles
    });

    socketInstance.on("connect", () => {
      console.log("[client] Notification socket connected");
    });

    socketInstance.on("verified", () => {
      console.log(userId);
      socketInstance.emit("get_notifications", userId);
    });

    socketInstance.on(
      "notification",
      (newNotification: {
        message: string;
        createdAt: Date;
        read: boolean;
        id: string;
      }) => {
        const { message, createdAt, read, id } = newNotification;
        const createdAtString = createdAt.toLocaleString();
        addNotification({ message, createdAt: createdAtString, read, id });
      },
    );
    socketInstance.off("top_notifications");
    socketInstance.on("top_notifications", (notifications: Notification[]) => {
      console.log(notifications);
      notifications.forEach((notification) => {
        const { id, message, createdAt, read } = notification;
        const createdAtString = createdAt.toLocaleString();
        addNotification({ id, message, createdAt: createdAtString, read });
      });
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[client] Notification socket disconnected:", reason);
    });

    socketInstance.on("error", (res) => {
      console.error(res.message);
      toast.error(`Failed to fetch notifications`);
    });

    socketInstance.on("connect_error", (err) => {
      console.error(
        "[client] Notification socket connection error:",
        err.message,
      );
    });
    // 2. Cleanup: Only runs on logout or app close
    return () => {
      console.log("[client] Disconnecting notification socket");
      socketInstance.disconnect();
      setSocket(null);
    };
  }, [userId]); // Only re-run if userId changes (Login/Logout)

  return (
    <NotificationContext.Provider value={socket}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationSocket = () => useContext(NotificationContext);
