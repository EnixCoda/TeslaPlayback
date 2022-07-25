import * as React from "react";
import { PlaybackEventGroup } from "./common";
import { getSortedKeys } from "./utils";

export function usePlaySibling(
  eventGroup: PlaybackEventGroup,
  currentEventTimestamp: string | null,
  setCurrentEventTimestamp: ReactSet<string | null>,
  currentClipsTimestamp: string | null,
  setCurrentTimestamp: ReactSet<string | null>
) {
  const allEventTimestampsOrdered = React.useMemo(() => getSortedKeys(eventGroup), [eventGroup]);
  const currentEventTimestamps = React.useMemo(() => {
    const currentEvent = currentEventTimestamp ? eventGroup[currentEventTimestamp] : null;
    return currentEvent ? getSortedKeys(currentEvent) : [];
  }, [currentEventTimestamp]);
  return React.useMemo(() => {
    if (currentClipsTimestamp === null || currentEventTimestamp === null) return;

    const currentClipIndex = currentEventTimestamps.indexOf(currentClipsTimestamp);
    const currentEventIndex = allEventTimestampsOrdered.indexOf(currentEventTimestamp);

    if (currentClipIndex === -1 || currentEventIndex === -1) return;

    return (clipOffset: number) => {
      const goTo = (eventIndex: number, clipIndex: number): void => {
        const targetEventTimestamp: string | undefined = allEventTimestampsOrdered[eventIndex];
        if (!targetEventTimestamp) return;

        const targetEventTimestamps = getSortedKeys(eventGroup[targetEventTimestamp]);

        // Resolve relative `clipIndex`
        // For example, if every event has 2 clips, then
        //   goTo(2, 1) => set
        //   goTo(2, -3) => goTo(1, -1) => goTo(0, 1) => set
        //   goTo(2, 3) => goTo(3, 1) => set
        //   goTo(0, -1) => fail
        if (clipIndex < 0) {
          const fixedIndex = clipIndex + targetEventTimestamps.length;
          if (fixedIndex < 0) return goTo(eventIndex - 1, fixedIndex);
          else clipIndex = fixedIndex;
        } else if (clipIndex > targetEventTimestamps.length - 1) {
          const fixedIndex = clipIndex - targetEventTimestamps.length;
          return goTo(eventIndex + 1, fixedIndex);
        }
        const targetClipTimestamp = targetEventTimestamps[clipIndex];

        if (targetEventTimestamp !== currentEventTimestamp) setCurrentEventTimestamp(targetEventTimestamp);
        if (targetClipTimestamp !== currentClipsTimestamp) setCurrentTimestamp(targetClipTimestamp);
      };

      // for the first run, adjust eventIndex if clipIndex is negative
      const targetClipIndex = currentClipIndex + clipOffset;
      if (targetClipIndex < 0) goTo(currentEventIndex - 1, targetClipIndex);
      else goTo(currentEventIndex, targetClipIndex);
    };
  }, [currentClipsTimestamp, currentEventTimestamp, currentEventTimestamps, allEventTimestampsOrdered]);
}
