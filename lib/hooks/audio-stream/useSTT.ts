import { useParticipantRecorders } from "./useParticipantRecorders";
import { useRoomContext } from "@livekit/components-react";

export const useSTT = () => {
  console.log("STT - Processing")

  const room = useRoomContext();
  const recorders = useParticipantRecorders(room);

  

  return audioProcessor;
}
