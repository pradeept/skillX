export const createOffer = async () => {
  const stun = process.env.STUN_URL as string;
  const turn = process.env.TURN_URL as string;
  const turnUser = process.env.TURN_USER as string;
  const turnCredential = process.env.TURN_PASSWORD as string;

  const rc = new RTCPeerConnection({
    iceServers: [
      {
        urls: stun,
      },
      {
        urls: turn,
        username: turnUser,
        credential: turnCredential,
      },
    ],
  });
};
