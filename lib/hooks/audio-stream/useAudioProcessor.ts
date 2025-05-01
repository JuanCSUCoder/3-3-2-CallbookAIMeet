
import { Room } from "livekit-client";
import { useEffect, useState } from "react";
import { useAudio } from "./useAudio";

export const useAudioProcessor = (room: Room) => {
  console.log("STT.Processor - Processing")

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
          console.log("STT.Processor - Module Added", module)
          setWorklet(new AudioWorkletNode(audioContext, 'PcmProcessor'));
          console.log("STT.Processor - Worklet created");
          return audioContext.resume()
        }).then(res => console.log("STT.Processor - Ready", res));
    }
  }, [streams, audioContext]);

  return pcmWorklet;
};