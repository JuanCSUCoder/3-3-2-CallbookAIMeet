import { SOCKET_STATES } from "@deepgram/sdk";
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
    recorder.audioRecorder.ondataavailable = (event) => {
      const audioBlob = new Blob([event.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log("Audio URL:", audioUrl);
    }
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
