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
  subtitles: any;
  disconnectSTT: () => Promise<void>;
} => {
  // console.log("STT - Processing")

  // Disable Livekit logging
  setLogLevel(LogLevel.silent);

  const room = useRoomContext();
  const recorders = useParticipantRecorders(room);
  const { connectToDeepgram, disconnectFromDeepgram, connection, connectionState } = useDeepgram();
  const [subtitles, setSubtitles] = useState<ParticipantSubtitles[]>([]);

  // 1. Connect to Deepgram
  const connectSTT = async () => await connectToDeepgram({
    model: "nova-3",
    interim_results: true,
    smart_format: true,
    filler_words: true,
    utterance_end_ms: 3000,
    punctuate: true,
  });
  const disconnectSTT = async () => await disconnectFromDeepgram();
  useEffect(() => {
    connectSTT().then(() => {
      console.log("STT - Connected to Deepgram");
    }).catch((error) => {
      console.error("STT - Error connecting to Deepgram", error);
    });
  }, []);

  // 2. Send audio stream to Deepgram
  recorders.forEach(recorder => {
    // Send recorder data when available to Deepgram
    recorder.audioRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && connection) {
        connection.send(event.data);
      }
    }
  });

  // 3. Receive subtitles from Deepgram
  useEffect(() => {
    if (connection) {
      connection?.on(LiveTranscriptionEvents.Transcript, (transcript) => {
        console.log("STT - Transcript", transcript.channel.alternatives[0].transcript);
      });
    }
  }, [connection]);

  return {
    connectionState,
    subtitles,
    disconnectSTT,
  };
}
