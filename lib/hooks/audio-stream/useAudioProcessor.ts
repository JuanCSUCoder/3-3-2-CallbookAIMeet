
import { Room } from "livekit-client";
import { useEffect, useState } from "react";
import { useAudio } from "./useAudio";

export const useAudioProcessor = (room: Room) => {
  console.log("STT.Processor - Processing")

  const [streams, audioContext] = useAudio(room);

  const [pcmWorklet, setWorklet] = useState<AudioWorkletNode | null>(null);
  const [sources, setSources] = useState<MediaStreamAudioSourceNode[]>([]);

  // 1. Inicializa el procesador de audio: AudioWorklet
  useEffect(() => {
    console.log("STT - Audio info", streams, audioContext);

    if (audioContext) {
      audioContext.audioWorklet.addModule('/audio-pcm-worklet.js')
        .then((module) => {
          console.log("STT.Processor - Module Added", module)
          setWorklet(new AudioWorkletNode(audioContext, 'PcmProcessor'));
          console.log("STT.Processor - Worklet created");
          return audioContext.resume()
        }).then(res => console.log("STT.Processor - Ready", res));
    }
  }, [audioContext]);

  // 2. Conecta el AudioWorklet a los streams de audio
  useEffect(() => {
    if (audioContext && pcmWorklet) {
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];

        // 1. Crea el MediaStreamSource
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);

        // 2. Conecta el MediaStreamSource al AudioWorklet
        mediaStreamSource.connect(pcmWorklet);

        // 3. Conecta el AudioWorklet al destino de audio
        pcmWorklet.connect(audioContext.destination);

        setSources((prev) => {
          const newSources = [...prev, mediaStreamSource];
          return newSources;
        });
      }
    }
  }, [streams, audioContext, pcmWorklet]);

  return pcmWorklet;
};