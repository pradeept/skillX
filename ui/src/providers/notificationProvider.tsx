// @/context/NotificationSocketContext.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import useUserStore from "@/store/userStore";
import useNotificationStore from "@/store/notificationStore";

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
      console.log("[client] Notification socket connected:", socketInstance.id);
      setSocket(socketInstance);
    });

    socketInstance.on("verified", () => {
      socketInstance.emit("get_notifications", userId);
    });

    socketInstance.on("notification", (newNotification) => {
      addNotification(newNotification);
    });

    socketInstance.on("top_notifications", (notifications: any[]) => {
      notifications.forEach((n) => addNotification(n));
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
