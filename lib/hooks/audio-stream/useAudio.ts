import { useTracks } from "@livekit/components-react";
import { Participant, Room, RoomEvent, Track, TrackPublication } from "livekit-client";
import { useEffect, useState } from "react";

export const useAudio = (room: Room): [MediaStream[], AudioContext | null] => {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [audioStreams, setAudioStreams] = useState<MediaStream[]>([]);

  console.log("STT.Processor.Audio - Processing")

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

  console.log("STT.Processor.Audio - Tracks", tracks);

  useEffect(() => {
    // 2. Get audio streams for the participants, to send to STT
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i] as TrackReference;
      const mediaStream = track.publication.track?.mediaStream;
      if (mediaStream) {
        setAudioStreams(streams => {
          return [...streams,]
        });
      }
    }

    // 2. Create audio context and media stream source
    const audioContext = new AudioContext();
    setAudioContext(audioContext);
  }, [tracks]);

  return [audioStreams, audioContext];
};