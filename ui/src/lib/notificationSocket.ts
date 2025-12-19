import { io, Socket } from "socket.io-client";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_HOST}/notification`;

let socket: Socket | null = null;

export const getNotificationSocket = (userId?: string) => {
  const userId = useUserStore((state) => state.userInfo?.userId);

  const { addNotification } = useNotificationStore((state) => state);
  if (!socket && userId) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { userId },
      transports: ["websocket"],
    });

    configureNotification(socket);
  }

  return socket;
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

const configureNotification = async (socket: Socket) => {
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
      const { message, createdAt, read, id } = newNotification;
      const createdAtString = createdAt.toLocaleString();
      addNotification({ message, createdAt: createdAtString, read, id });
    },
  );
  socket.off("top_notifications");
  socket.on("top_notifications", (notifications: Notification[]) => {
    console.log(notifications);
    notifications.forEach((notification) => {
      const { id, message, createdAt, read } = notification;
      const createdAtString = createdAt.toLocaleString();
      addNotification({ id, message, createdAt: createdAtString, read });
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
};
