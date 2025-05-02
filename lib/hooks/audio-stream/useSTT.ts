import { LiveTranscriptionEvents, SOCKET_STATES } from "@deepgram/sdk";
import { useDeepgram } from "../deepgram-wrapper/useDeepgram";
import { useParticipantRecorders } from "./useParticipantRecorders";
import { useRoomContext } from "@livekit/components-react";
import { use, useEffect, useState } from "react";
import { LogLevel, setLogLevel } from "livekit-client";

export interface ParticipantSubtitles {
  participant: string;
  subtitles: string[];
}

export const useSTT = (): {
  connectionState: SOCKET_STATES;
  subtitles: string[];
} => {
  // console.log("STT - Processing")

  // Disable Livekit logging
  setLogLevel(LogLevel.silent);

  const room = useRoomContext();
  const recorders = useParticipantRecorders(room);
  const [subtitles, setSubtitles] = useState<string[]>([]);

  // 1. Connect to Deepgram
  const { connection, connectionState, reconnect } = useDeepgram();

  useEffect(() => {
    console.log("STT.recorders.reconn - Reconnecting to Deepgram");
    reconnect();
  }, [recorders]);

  // 2. Send audio stream to Deepgram
  useEffect(() => {
    console.log("STT.recorders - Updating recorders", recorders);
    recorders.forEach(recorder => {
      // Send recorder data when available to Deepgram
      recorder.audioRecorder.ondataavailable = (event) => {
        if (event.data.size > 100 && connection) {
          // console.log("STT - Sending audio data to Deepgram", event.data);
          connection.send(event.data);
        }
      }
    });
  }, [recorders, connection]);

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
  };
}
