"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Video() {
  // get the slug (id)
  const {slug} = useParams();
  const [error, setError] = useState("");

  const fetchRoomId = async () => {
    try {
      const response = await fetch(`http://localhost:3004/api/video/${slug}`);
      console.log(response);
      return response;
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRoomId()
      .then((res) => res?.json())
      .then((body) => console.log(body.data.roomId))
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
