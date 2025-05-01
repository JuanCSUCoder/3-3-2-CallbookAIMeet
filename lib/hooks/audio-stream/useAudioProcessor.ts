import { useParticipants, useTracks } from "@livekit/components-react";
import { Participant, Room, RoomEvent, Track, TrackPublication } from "livekit-client";
import { useEffect, useState } from "react";
import { useAudio } from "./useAudio";

export const useAudioProcessor = (room: Room) => {
  const [streams, audioContext] = useAudio(room);
  const [pcmWorklet, setWorklet] = useState<AudioWorkletNode | null>(null);

  useEffect(() => {
    console.log("STT - Audio info", streams, audioContext);

    if (audioContext && streams.length > 0) {
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];

        const mediaStreamSource = audioContext.createMediaStreamSource(stream);

        mediaStreamSource.connect(audioContext.destination);
      }

      audioContext.audioWorklet.addModule('audio-pcm-worklet.js')
        .then((module) => {
          console.log("STT - Module Added", module)
          setWorklet(new AudioWorkletNode(audioContext, 'PcmProcessor'));
          console.log("STT - Worklet created");
          return audioContext.resume()
        }).then(res => console.log("STT - Ready", res));
    }
  }, [streams, audioContext]);

  return pcmWorklet;
};