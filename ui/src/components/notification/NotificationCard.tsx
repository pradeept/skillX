"use client";
import useNotificationStore from "@/store/notificationStore";
import { backend } from "@/utils/axiosConfig";
import { useMutation } from "@tanstack/react-query";
import { Check, CheckCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function NotificationCard({
  id,
  message,
  time,
  read,
}: {
  id: string;
  message: string;
  time: string;
  read: boolean;
}) {
  const markAsRead = useNotificationStore((state) => state.markAsRead);

  const notificationMutation = useMutation({
    mutationFn: (id: string) => {
      return backend.patch(`/notification/${id}`);
    },
    onError: (e) => {
      console.error(e.message);
      toast.error("Failed to update the status");
    },
    onSuccess: () => {
      markAsRead(id);
      toast.success("Notification marked as read");
    },
  });
  const handleRead = () => {
    notificationMutation.mutate(id);
  };
  return (
    <div className="flex justify-around items-center">
      <Link
        href={`/notification`}
        className={`flex flex-col gap-1 p-2 rounded ${read ? "dark:bg-slate-900 bg-slate-50" : "dark:bg-slate-800 bg-slate-200"}`}
      >
        <p>{message}</p>
        <small className="text-start">{time}</small>
      </Link>
      {!read ? (
        <Check
          size={18}
          onClick={handleRead}
          className="bg-green-300 rounded p-0.5 text-black cursor-pointer"
        />
      ) : (
        <CheckCheck size={18} className="dark:text-blue-300 text-blue-400" />
      )}
    </div>
  );
}
