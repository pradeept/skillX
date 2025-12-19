"use client";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import useNotificationStore from "@/store/notificationStore";
import NotificationCard from "./NotificationCard";
import Link from "next/link";

export default function Notifications() {
  const notifications = useNotificationStore((state) => state.notifications);
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            <Bell />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 flex flex-col gap-1" align="start">
          {notifications.map((notification, index) => (
            <NotificationCard
              key={index}
              id={notification.id}
              message={notification.message}
              time={new Date(notification.createdAt).toLocaleString()}
              read={notification.read}
            />
          ))}
          <Link
            href={"/notification"}
            className="text-center text-sm mt-1 underline"
          >
            View All
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
