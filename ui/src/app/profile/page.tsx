"use client";
import Navbar from "@/components/navbar/NavBar";
import { useNotificationSocket } from "@/hooks/useNotification";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function Profile() {
  // notification socket
  // make /profile call and get profile
  // cross check if user is still valid (if token is in cache)
  // UI:
  // allow profile editing
  // implement profile updating api call
  // useNotificationSocket();
  const socket = useNotificationSocket();
  return (
    <>
      <Navbar />
      <p>Status: {socket.current?.connected ? "🟢 Online" : "🔴 Offline"}</p>
    </>
  );
}
