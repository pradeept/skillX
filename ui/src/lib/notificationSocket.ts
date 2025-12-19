import { io, Socket } from "socket.io-client";

const SOCKET_URL = `${process.env.NEXT_PUBLIC_HOST}/notification`;

let socket: Socket | null = null;

export const getNotificationSocket = (userId?: string) => {
  if (!socket && userId) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      auth: { userId },
      transports: ["websocket"],
    });
  }

  return socket;
};

export const disconnectNotificationSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
