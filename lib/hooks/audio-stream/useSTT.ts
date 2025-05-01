import { LiveTranscriptionEvents, SOCKET_STATES } from "@deepgram/sdk";
import { useDeepgram } from "../deepgram-wrapper/useDeepgram";
import { useParticipantRecorders } from "./useParticipantRecorders";
import { useRoomContext } from "@livekit/components-react";
import { useState } from "react";

export interface ParticipantSubtitles {
  participant: string;
  subtitles: string[];
}

export const useSTT = (): {
  connectSTT: () => Promise<void>;
  disconnectSTT: () => Promise<void>;
  connectionState: SOCKET_STATES;
  subtitles: any;
} => {
  console.log("STT - Processing")

  const room = useRoomContext();
  const recorders = useParticipantRecorders(room);
  const { connectToDeepgram, disconnectFromDeepgram, connection, connectionState } = useDeepgram();
  const [subtitles, setSubtitles] = useState<ParticipantSubtitles[]>([]);

  recorders.forEach(recorder => {
    // Send recorder data when available to Deepgram
    recorder.audioRecorder.ondataavailable = (event) => {
      if (event.data.size > 0 && connection) {
        connection.send(event.data);
      }
    }
  });

  connection?.on(LiveTranscriptionEvents.Transcript, (transcript) => {
    console.log("STT - Transcript", transcript.channel.alternatives[0].transcript);
   });

  return {
    connectSTT: async () => await connectToDeepgram({
      model: "nova-3",
      interim_results: true,
      smart_format: true,
      filler_words: true,
      utterance_end_ms: 3000,
      punctuate: true,
    }),
    disconnectSTT: async () => await disconnectFromDeepgram(),
    connectionState,
    subtitles,
  };
}
