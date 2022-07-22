import * as React from "react";

export function usePlaySibling(
  allEventTimestampsOrdered: string[],
  currentEventTimestamps: string[],
  currentEventTimestamp: string | null,
  setCurrentEventTimestamp: React.Dispatch<React.SetStateAction<string | null>>,
  currentClipTimestamp: string | null,
  setCurrentTimestamp: React.Dispatch<React.SetStateAction<string | null>>) {
  return React.useCallback(
    (clipOffset: 1 | -1) => {
      if (currentClipTimestamp === null || currentEventTimestamp === null) {
        return;
      }

      const currentClipIndex = currentEventTimestamps.indexOf(currentClipTimestamp);
      const currentEventIndex = allEventTimestampsOrdered.indexOf(currentEventTimestamp);

      const goTo = (eventIndex: number, clipIndex: number): void => {
        if (eventIndex < 0 || eventIndex > allEventTimestampsOrdered.length - 1)
          return;
        const targetEventTimestamp = allEventTimestampsOrdered[eventIndex];

        // Resolve relative `clipIndex`
        // For example, if every event has 2 clips, then
        //   goTo(2, 1) => set
        //   goTo(2, -3) => goTo(1, -1) => goTo(0, 1) => set
        //   goTo(2, 3) => goTo(3, 1) => set
        //   goTo(0, -1) => fail
        if (clipIndex < 0) {
          const fixedIndex = clipIndex + targetEventTimestamp.length;
          if (fixedIndex < 0)
            return goTo(eventIndex - 1, fixedIndex);
        } else if (clipIndex > targetEventTimestamp.length - 1) {
          const fixedIndex = clipIndex - targetEventTimestamp.length;
          if (fixedIndex > targetEventTimestamp.length - 1)
            return goTo(eventIndex + 1, fixedIndex);
        }
        const targetClipTimestamp = currentEventTimestamps[clipIndex];

        if (targetEventTimestamp !== currentEventTimestamp)
          setCurrentEventTimestamp(targetEventTimestamp);
        if (targetClipTimestamp !== currentClipTimestamp)
          setCurrentTimestamp(targetClipTimestamp);
      };

      goTo(currentEventIndex, currentClipIndex + clipOffset);
    },
    [currentClipTimestamp, currentEventTimestamp, currentEventTimestamps, allEventTimestampsOrdered]
  );
}
