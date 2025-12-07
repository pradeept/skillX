"use client";
import { socket } from "@/utils/socket";
import { createOffer } from "@/utils/webRTC";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Video() {
  // get the slug (id)
  const { slug } = useParams();
  const [error, setError] = useState("");
  const [meetId, setMeetId] = useState<string | null>(null);
  const socket = io("http://localhost:3004/api/video", {
    extraHeaders: {
      Authorization: process.env.AUTH_TOKEN as string,
    },
    query: {
      userId: process.env.USER_ID as string,
      roomId: process.env.ROOM_ID as string,
    },
  });
  const fetchRoomId = async () => {
    try {
      const response = await fetch(`http://localhost:3004/api/video/${slug}`);
      console.log(response);
      return response;
    } catch (e) {
      console.error(e);
    }
  };

  const connectSocket = async () => {
    if (meetId) {
      socket.connect();
      socket.on("connection", () => {
        console.log("[client] Socket connected");
      });
      // socket.on("create-offer", createOffer);
    }
  };

  useEffect(() => {
    fetchRoomId()
      .then((res) => res?.json())
      .then((body) => setMeetId(body.meetId))
      .catch((e) => setError("Failed to get the room Id"));
  });
  // make get request to
  // /api/video?id=slug
  // if response is okay & got roomId
  // else show error page statating (Please join before 5 mins of the video meet
  // schedule!)

  // make socket connection at /api/video/roomId
  // emit 'connected'
  // listen for 'createOffer'
  /*
            - client will get stun and turn url along with
             short lived creds for turn
            - use that to create RTCPeerconnection
            - generate ice candidates (once generate <promise>
              emit the offer)
        */
  // listen for 'createAnswer'
  // listen for 'offer'
  // listen for 'answer'
  return (
    <>
      <section>
        <div>
          <p>User1</p>
        </div>
        <div>
          <p>Remote user</p>
        </div>
        {error && <p>Get request failed</p>}
      </section>
      {/* current user's video and audio  */}
      {/* Controls will be added later */}

      {/* --------------------------- */}

      {/* remote user's video and audio  */}
      {/* Controls will not be shown for remote user */}
    </>
  );
}
