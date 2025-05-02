
import { Room } from "livekit-client";
import { useEffect, useState } from "react";
import { useParticipantStreams } from "./useParticipantStreams";

export interface ParticipantRecorder {
  participant: string;
  audioRecorder: MediaRecorder;
}

export const useParticipantRecorders = (room: Room): ParticipantRecorder[] => {
  // console.log("STT.Processor - Processing")

  const streams = useParticipantStreams(room);
  const [mediaRecorders, setMediaRecorders] = useState<ParticipantRecorder[]>([]);

  useEffect(() => {
    // console.log("STT.Processor - Streams Changed", streams);
    setMediaRecorders(_ => {
      return streams.map((stream) => {
        const audioRecorder = new MediaRecorder(stream.audioStream, {
          mimeType: "audio/webm; codecs=opus",
          audioBitsPerSecond: 128000,
        });

        audioRecorder.start(250);
        audioRecorder.resume();

        return {
          audioRecorder,
          participant: stream.participant,
        };
      });
    });
  }, [streams]);

  return mediaRecorders;
};