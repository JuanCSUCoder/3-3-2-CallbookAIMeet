import { LiveTranscriptionEvents, SOCKET_STATES } from "@deepgram/sdk";
import { useDeepgram } from "../deepgram-wrapper/useDeepgram";
import { useParticipantRecorders } from "./useParticipantRecorders";
import { useRoomContext } from "@livekit/components-react";
import { useEffect, useState } from "react";
import { LogLevel, setLogLevel } from "livekit-client";

export interface ParticipantSubtitles {
  participant: string;
  subtitles: string[];
}

export const useSTT = (): {
  connectionState: SOCKET_STATES;
  subtitles: string[];
  disconnectSTT: () => Promise<void>;
} => {
  // console.log("STT - Processing")

  // Disable Livekit logging
  setLogLevel(LogLevel.silent);

  const room = useRoomContext();
  const recorders = useParticipantRecorders(room);
  const { connectToDeepgram, disconnectFromDeepgram, connection, connectionState } = useDeepgram();
  const [subtitles, setSubtitles] = useState<string[]>([]);

  // Utility methods
  const connectSTT = async () => await connectToDeepgram({
    model: "nova-3",
    interim_results: true,
    smart_format: true,
    filler_words: true,
    punctuate: true,
    language: "multi",
  });
  const disconnectSTT = async () => await disconnectFromDeepgram();
  const reconnectSTT = async () => {
    if (connectionState == SOCKET_STATES.closed) {
      await connectSTT()
    }
  };

  // 1. Connect to Deepgram
  useEffect(() => {
    connectSTT().then(() => {
      console.log("STT.connect - Connected to Deepgram");
    }).catch((error) => {
      console.error("STT.connect - Error connecting to Deepgram", error);
    });
  }, []);

  // 2. Send audio stream to Deepgram
  useEffect(() => {
    // console.log("STT - Recorders Changed", recorders);
    recorders.forEach(recorder => {
      // Send recorder data when available to Deepgram
      recorder.audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 0 && connection) {
          // console.log("STT - Sending audio data to Deepgram", event.data);
          connection.send(event.data);
        }
      }
    });
  }, [recorders, connection]);

  // Reconnect to Deepgram if connection state changes
  useEffect(() => {
    console.log("STT - Connection State Changed", connectionState == SOCKET_STATES.open, connectionState);
    // reconnectSTT().then(() => {
    //   console.log("STT.connectionState - Reconnected to Deepgram");
    // }
    // ).catch((error) => {
    //   console.error("STT.connectionState - Error reconnecting to Deepgram", error);
    // });
  }, [connectionState]);

  // 3. Receive subtitles from Deepgram
  useEffect(() => {
    console.log("STT.connection - Connection Changed", connectionState == SOCKET_STATES.open, connectionState);
    if (connection) {
      connection?.on(LiveTranscriptionEvents.Transcript, (transcript) => {
        const text = transcript.channel.alternatives[0].transcript;
        console.log("STT - Transcript \"" + text + "\"");
        if (text !== "") {
          setSubtitles((prev) => [...prev, text]);
        }
      });
    }
  }, [connection]);

  return {
    connectionState,
    subtitles,
    disconnectSTT,
  };
}
