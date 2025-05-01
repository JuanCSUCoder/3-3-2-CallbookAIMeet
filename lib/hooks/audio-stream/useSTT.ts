import { useAudioProcessor } from "./useAudioProcessor";
import { useRoomContext } from "@livekit/components-react";

export const useSTT = () => {
  console.log("STT - Processing")

  const room = useRoomContext();
  const audioProcessor = useAudioProcessor(room);

  if (audioProcessor) {
    console.log("STT - Got processor", audioProcessor);
    audioProcessor.port.onmessage = (event) => {
      const { data } = event;
      console.log("STT - Audio data", data);
      // Process the audio data here
    };
  }

  return audioProcessor;
}
