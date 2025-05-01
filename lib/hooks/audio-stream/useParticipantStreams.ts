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
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
    ],
    room,
  });

  // console.log("STT.Processor.Audio - Tracks", tracks);

  useEffect(() => {
    // 2. Get audio streams for the participants, to send to STT
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i] as TrackReference;
      const mediaStream = track.publication.track?.mediaStream;
      if (mediaStream) {
        setAudioStreams(streams => {
          return [...streams, {
            participant: track.participant.identity,
            audioStream: mediaStream,
          }]
        });
      }
    }
  }, [tracks]);

  return audioStreams;
};