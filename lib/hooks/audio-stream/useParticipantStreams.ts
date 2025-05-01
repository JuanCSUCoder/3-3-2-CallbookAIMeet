import { useTracks } from "@livekit/components-react";
import { Participant, Room, RoomEvent, Track, TrackPublication } from "livekit-client";
import { useEffect, useState } from "react";

export interface ParticipantStream {
  participant: string;
  audioStream: MediaStream;
}

export const useParticipantStreams = (room: Room): ParticipantStream[] => {
  const [audioStreams, setAudioStreams] = useState<ParticipantStream[]>([]);

  // console.log("STT.Processor.Audio - Processing")

  type TrackReference = {
    participant: Participant;
    publication: TrackPublication;
    source: Track.Source;
  };

  // 1. Get audio stream for the first participant, to send to STT
  const tracks = useTracks(["microphone"] as Track.Source[], {
    updateOnlyOn: [
      RoomEvent.ParticipantConnected,
      RoomEvent.ParticipantDisconnected,
      RoomEvent.ConnectionStateChanged,
      RoomEvent.ParticipantMetadataChanged,
      // RoomEvent.TrackPublished,
      // RoomEvent.TrackUnpublished,
      RoomEvent.TrackMuted,
      RoomEvent.TrackUnmuted,
    ],
    room,
  });

  // console.log("STT.Processor.Audio - Tracks", tracks);

  useEffect(() => {
    // console.log("STT.Processor.Audio - Tracks Changed", tracks);
    // 2. Get audio streams for the participants, to send to STT
    setAudioStreams(_ => {
      return tracks.map((track) => ({
        participant: track.participant.identity as string,
        audioStream: track.publication.track?.mediaStream as MediaStream,
      } as ParticipantStream));
    });
  }, [tracks]);

  return audioStreams;
};