import { Room } from "livekit-client";
import { useAudioProcessor } from "./useAudioProcessor";
import { useRoomContext } from "@livekit/components-react";

export const useSTT = () => {
  const room = useRoomContext();
  const audioProcessor = useAudioProcessor(room);

  console.log("STT - Processing")

  return audioProcessor;
}
