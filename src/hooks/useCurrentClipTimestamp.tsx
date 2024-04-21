import { useEffect, useMemo, useState } from "react";
import { TeslaFS } from "../TeslaFS";
import { PlaybackEvent } from "../common";
import { getSortedKeys } from "../utils/general";

export function useCurrentEventClips(currentEvent: PlaybackEvent | null) {
  const currentEventTimestamps = useMemo(() => (currentEvent ? getSortedKeys(currentEvent) : null), [currentEvent]);
  const [currentClipsTimestamp, setCurrentClipsTimestamp] = useState<TeslaFS.Timestamp | null>(null);
  useEffect(() => {
    // Only trigger on first load or after manual reset, so this does not set clip index to first when nav with play control
    if (currentEventTimestamps) {
      const [timestamp] = currentEventTimestamps;
      setCurrentClipsTimestamp(timestamp);
    }
  }, [currentEventTimestamps]);

  const clipGroup = useMemo(() => {
    const clips = (currentClipsTimestamp && currentEvent && currentEvent[currentClipsTimestamp]) || null;
    return (
      (clips &&
        currentClipsTimestamp && {
          timestamp: currentClipsTimestamp,
          clips,
        }) ||
      null
    );
  }, [currentClipsTimestamp, currentEvent]);

  return {
    clipGroup,
    setCurrentClipsTimestamp,
  };
}
