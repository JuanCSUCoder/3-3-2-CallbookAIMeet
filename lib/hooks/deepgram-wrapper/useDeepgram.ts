import { createClient, LiveClient, LiveSchema, LiveTranscriptionEvents, SOCKET_STATES } from "@deepgram/sdk";
import { useEffect, useRef, useState } from "react";

export const useDeepgram = () => {
  const [reconnectCount, setReconnectCount] = useState(0);
  const [connection, setConnection] = useState<LiveClient | null>(null);
  const [connectionState, setConnectionState] = useState<SOCKET_STATES>(SOCKET_STATES.closed);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const reconnect = () => {
    if (connection) {
      connection.requestClose();
      setConnection(null);
    }
    intervalRef.current && clearInterval(intervalRef.current);
    setReconnectCount((prev) => prev + 1);
  };

  useEffect(() => {
    const options: LiveSchema = {
      model: "nova-3",
      interim_results: true,
      smart_format: true,
      filler_words: true,
      punctuate: true,
      language: "multi",
    };

    const key = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
    const endpoint = process.env.NEXT_PUBLIC_DEEPGRAM_API_ENDPOINT || ":version/listen";
    console.log("STT - Connecting to Deepgram, count: ", reconnectCount);
    const deepgram = createClient(key);

    const conn = deepgram.listen.live(options, endpoint);

    conn.on(LiveTranscriptionEvents.Open, () => {
      setConnectionState(SOCKET_STATES.open);
    });

    conn.on(LiveTranscriptionEvents.Close, () => {
      setConnectionState(SOCKET_STATES.closed);
      reconnect();
    });

    conn.on(LiveTranscriptionEvents.Error, (error) => {
      console.error("STT.Deepgram - Error connecting to Deepgram", error);
      reconnect();
    });

    conn.on(LiveTranscriptionEvents.Unhandled, () => {
      console.error("STT.Deepgram - Unhandled event");
      reconnect();
    }); 

    intervalRef.current = setInterval(() => {
      conn.keepAlive();
    }, 500);

    setConnection(conn);
  }, [reconnectCount]);

  return {
    connection,
    connectionState,
  }
};