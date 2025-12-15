"use client";
import { useNotificationSocket } from "@/hooks/useNotification";

export default function Profile() {
  // notification socket
  // make /profile call and get profile
  // cross check if user is still valid (if token is in cache)
  // UI:
  // allow profile editing
  // implement profile updating api call
  const socketClient = useNotificationSocket();

  return <>Hello there</>;
}
