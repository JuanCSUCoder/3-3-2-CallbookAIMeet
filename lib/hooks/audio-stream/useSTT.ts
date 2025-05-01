import { useParticipants, useTracks } from "@livekit/components-react";
import { Participant, Room, RoomEvent, Track, TrackPublication } from "livekit-client";
import { useEffect, useState } from "react";
import { useAudio } from "./useAudio";

export const useSTT = (room: Room) => {
  const [streams, audioContext] = useAudio(room);

  useEffect(() => {
    if (audioContext && streams.length > 0) {
      // 1. Get audio stream for the first participant, to send to STT
      const mediaStream = track.publication.track?.mediaStream;
      console.log('mediaStream', mediaStream);

      // 4. Create media stream source
      const mediaStreamSource = audioContext.createMediaStreamSource(audioContext);
      console.log('mediaStreamSource', mediaStreamSource);

      // 5. Connect the media stream source to the audio context
      mediaStreamSource.connect(audioContext.destination);

      // 6. Start the audio context
      audioContext.resume();
      
    }
  }, [audioContext]);
};