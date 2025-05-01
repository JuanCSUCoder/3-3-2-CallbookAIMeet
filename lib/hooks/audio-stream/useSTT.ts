import { Room } from "livekit-client";
import { useAudioProcessor } from "./useAudioProcessor";
import { useRoomContext } from "@livekit/components-react";

export const useSTT = () => {
  console.log("STT - Processing")

  const room = useRoomContext();
  const audioProcessor = useAudioProcessor(room);

  return audioProcessor;
}
