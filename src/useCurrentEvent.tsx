import { useEffect, useMemo, useState } from "react";
import { PlaybackEventGroup } from "./common";
import { TeslaFS } from "./TeslaFS";

export function useCurrentEvent(allEventTimestampsOrdered: string[], eventGroup: PlaybackEventGroup) {
  const [currentEventTimestamp, setCurrentEventTimestamp] = useState<TeslaFS.Timestamp | null>(null);
  useEffect(() => {
    const [firstEventTimestamp] = allEventTimestampsOrdered;
    setCurrentEventTimestamp(firstEventTimestamp);
  }, [allEventTimestampsOrdered]);

  const currentEvent = useMemo(() => (currentEventTimestamp && eventGroup[currentEventTimestamp]) || null, [currentEventTimestamp, eventGroup]);
  const currentEventTimestamps: TeslaFS.Timestamp[] = useMemo(() => (currentEvent ? Object.keys(currentEvent).sort() : []), [currentEvent]);
  return {
    currentEvent,
    setCurrentEventTimestamp,
    currentEventTimestamp,
    currentEventTimestamps,
  };
}
