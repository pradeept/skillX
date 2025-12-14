"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useWebRTC } from "./_hook"; // Adjust path
import { VideoPlayer } from "./_videoStream"; // Adjust path

export default function VideoRoom() {
  const { slug } = useParams();
  const [meetId, setMeetId] = useState<string | null>(null);
  const [apiError, setApiError] = useState("");

  // Dummy User ID - replace with real logic/context
  const userId = process.env.NEXT_PUBLIC_USER_ID || "user_123";

  // 1. Fetch Room ID on mount
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const res = await fetch(`http://localhost:3004/api/video/${slug}`);
        if (res.ok) {
          const data = await res.json();
          console.log(data.data.meetId);
          setMeetId(data.data.meetId);
        } else {
          setApiError("Please join before 5 mins of the video meet schedule!");
        }
      } catch (e) {
        setApiError("Failed to connect to video service.");
      }
    };

    if (slug) fetchRoom();
  }, [slug]);

  // 2. Initialize WebRTC Logic (only runs when meetId is present)
  const { localStream, remoteStream, connectionStatus } = useWebRTC(
    meetId,
    userId,
  );

  if (apiError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
        <div className="bg-gray-800 p-8 rounded-lg shadow-xl border border-red-500/30">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p>{apiError}</p>
        </div>
      </div>
    );
  }

  if (!meetId) {
    return (
      <div className="h-screen flex items-center justify-center text-white">
        Loading Room Details...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-900 p-4 flex flex-col items-center">
      {/* Status Bar */}
      <div className="w-full max-w-6xl mb-4 flex justify-between items-center text-white px-4">
        <h1 className="text-xl font-bold">Meeting Room: {slug}</h1>
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${remoteStream ? "bg-green-500" : "bg-yellow-500"}`}
          ></span>
          <span className="text-sm opacity-70">{connectionStatus}</span>
        </div>
      </div>

      {/* Video Grid - Vertical on Mobile, Horizontal on Desktop */}
      <div className="flex-1 w-full max-w-6xl flex flex-col md:flex-row gap-4 h-[80vh]">
        {/* Local User */}
        <div className="flex-1 w-full md:w-1/2 h-full">
          <VideoPlayer stream={localStream} isLocal={true} />
        </div>

        {/* Remote User */}
        <div className="flex-1 w-full md:w-1/2 h-full">
          {remoteStream ? (
            <VideoPlayer stream={remoteStream} />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-xl border border-dashed border-gray-600">
              <p className="text-gray-400 animate-pulse">
                Waiting for peer to join...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Controls Bar (Placeholder for future) */}
      <div className="mt-6 flex gap-4">
        {/* Add Mute/Camera/Hangup buttons here */}
      </div>
    </main>
  );
}
