import { createClient, LiveClient, LiveSchema, LiveTranscriptionEvents, SOCKET_STATES } from "@deepgram/sdk";
import { useState } from "react";

export const useDeepgram = () => {
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);

  const connectToDeepgram = async (options: LiveSchema) => {
    const key = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    const endpoint = process.env.NEXT_PUBLIC_DEEPGRAM_API_ENDPOINT || ":version/listen";
    console.log("STT - Connecting to Deepgram", { key, endpoint });
    const deepgram = createClient(key);

    const conn = deepgram.listen.live(options, endpoint);

    conn.on(LiveTranscriptionEvents.Open, () => {
      setConnectionState(SOCKET_STATES.open);
    });

    conn.on(LiveTranscriptionEvents.Close, () => {
      setConnectionState(SOCKET_STATES.closed);
    });

    setConnection(conn);
  };

  const disconnectFromDeepgram = async () => {
    if (connection) {
      connection.requestClose();
      setConnection(null);
    }
  };

  return {
    connectToDeepgram,
    disconnectFromDeepgram,
    connection,
    connectionState,
  }
};