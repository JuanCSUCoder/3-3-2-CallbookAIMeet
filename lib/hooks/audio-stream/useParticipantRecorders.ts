
import { Room } from "livekit-client";
import { useEffect, useState } from "react";
import { useParticipantStreams } from "./useParticipantStreams";

export interface ParticipantRecorder {
  participant: string;
  audioRecorder: MediaRecorder;
}

export const useParticipantRecorders = (room: Room) => {
  console.log("STT.Processor - Processing")

  const streams = useParticipantStreams(room);
  const [mediaRecorders, setMediaRecorders] = useState<MediaRecorder[]>([]);

  useEffect(() => {
    for (let i = 0; i < streams.length; i++) {
      const stream = streams[i];
      
      setMediaRecorders(prev => {
        const newMR = new MediaRecorder(stream, {
          mimeType: "audio/mpeg",
          audioBitsPerSecond: 128000,
        });

        newMR.start(250);
        newMR.resume();

        return [...prev, newMR];
      });
    }
  });

  return mediaRecorders;
};