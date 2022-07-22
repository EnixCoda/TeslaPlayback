import { useEffect, useMemo, useState } from "react";
import { PlaybackEvent, VideoGroup } from "./common";
import { TeslaFS } from "./TeslaFS";

export function useCurrentClipTimestamp(currentEventTimestamps: string[], currentEvent: PlaybackEvent | null) {
  const [currentClipTimestamp, setCurrentTimestamp] = useState<TeslaFS.Timestamp | null>(null);
  useEffect(() => {
    const [timestamp] = currentEventTimestamps;
    setCurrentTimestamp(timestamp);
  }, [currentEventTimestamps]);

  const currentPlaybackVideos: VideoGroup | null = useMemo(
    () => (currentClipTimestamp && currentEvent && currentEvent[currentClipTimestamp]) || null,
    [currentClipTimestamp, currentEvent]
  );

  return {
    currentClipTimestamp,
    setCurrentTimestamp,
    currentPlaybackVideos,
  };
}
