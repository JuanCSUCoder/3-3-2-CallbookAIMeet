import { Room } from "livekit-client";
import { useAudioProcessor } from "./useAudioProcessor";

export const useSTT = (room: Room) => {
  const audioProcessor = useAudioProcessor(room);
  
}