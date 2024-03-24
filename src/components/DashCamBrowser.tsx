import { Box, CounterLabel, FormControl } from "@primer/react";
import { useEffect, useMemo, useState } from "react";
import { TeslaFS } from "../TeslaFS";
import { PlaybackEventGroup } from "../common";
import { useCurrentEventClips } from "../hooks/useCurrentClipTimestamp";
import { useCurrentEvent } from "../hooks/useCurrentEvent";
import { useDashCamEvents } from "../hooks/useDashCamEvents";
import { usePlaySibling } from "../hooks/usePlaySibling";
import { getSortedKeys } from "../utils/general";
import { MatrixPlayer } from "./MatrixPlayer";
import { ParserLogViewer } from "./ParserLogViewer";
import { Select } from "./Select";
import { SubNavs } from "./SubNavs";
import { TimestampSelect } from "./TimestampSelect";

export function DashCamBrowser({ fileList }: { fileList: FileList }) {
  const { eventGroup, eventsIndex, parserLog } = useDashCamEvents(fileList) ?? {};
  const availableScopes = useMemo(() => TeslaFS.clipScopes.filter((scope) => !!eventsIndex[scope]?.length), [eventsIndex]);
  const [focusedScope, setFocusedScope] = useState<TeslaFS.ClipScope | null>(null);
  useEffect(() => {
    setFocusedScope(availableScopes[0] || null);
  }, [availableScopes]);

  const focusedEventGroup: PlaybackEventGroup = useMemo(() => {
    if (focusedScope === null) return eventGroup;
    return (
      eventsIndex[focusedScope]?.reduce((group, timestamp) => {
        group[timestamp] = eventGroup[timestamp];
        return group;
      }, {} as PlaybackEventGroup) ?? eventGroup
    );
  }, [eventGroup, focusedScope, eventsIndex]);
  const allEventTimestampsOrdered = useMemo(() => getSortedKeys(focusedEventGroup), [focusedEventGroup]);
  const { currentEvent, currentEventTimestamp, setCurrentEventTimestamp, currentEventTimestamps } = useCurrentEvent(
    allEventTimestampsOrdered,
    eventGroup
  );

  const { currentClipsTimestamp, setCurrentClipsTimestamp, currentClips } = useCurrentEventClips(currentEvent);

  const playSibling = usePlaySibling(
    focusedEventGroup,
    currentEventTimestamp,
    setCurrentEventTimestamp,
    currentClipsTimestamp,
    setCurrentClipsTimestamp
  );

  return (
    <>
      {parserLog.length > 0 && <ParserLogViewer parserLog={parserLog} />}
      <Box display="flex" flexDirection={["column", "column", "row"]} sx={{ gap: 1 }} overflow="auto">
        <Box as="nav" display="inline-flex" flexDirection="column" sx={{ gap: 2 }}>
          {availableScopes.length > 0 && <SubNavs options={availableScopes} value={focusedScope} onChange={(scope) => setFocusedScope(scope)} />}
          <Box display={["none", "none", "flex"]} flexWrap={["wrap", "nowrap", "nowrap"]} sx={{ gap: 1 }}>
            <FormControl>
              <FormControl.Label>
                Events <CounterLabel>{allEventTimestampsOrdered.length}</CounterLabel>
              </FormControl.Label>
              <TimestampSelect
                sx={{ maxHeight: 600, overflowY: "auto" }}
                options={allEventTimestampsOrdered}
                renderOption={(timestamp) => (
                  <>
                    {TeslaFS.formatTimestamp(timestamp)} <CounterLabel>{Object.keys(eventGroup[timestamp]).length}</CounterLabel>
                  </>
                )}
                value={currentEventTimestamp}
                onChange={(timestamp) => {
                  setCurrentClipsTimestamp(null);
                  setCurrentEventTimestamp(timestamp);
                }}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>Clips of event</FormControl.Label>
              <TimestampSelect
                sx={{ maxHeight: 600, overflowY: "auto" }}
                options={currentEventTimestamps}
                value={currentClipsTimestamp}
                onChange={setCurrentClipsTimestamp}
              />
            </FormControl>
          </Box>
          <Box display={["flex", "flex", "none"]} flexWrap={["wrap", "nowrap", "nowrap"]} sx={{ gap: 1 }}>
            <FormControl>
              <FormControl.Label>
                Events <CounterLabel>{allEventTimestampsOrdered.length}</CounterLabel>
              </FormControl.Label>
              <Select
                options={allEventTimestampsOrdered}
                renderOption={(timestamp) => `${TeslaFS.formatTimestamp(timestamp)} (${Object.keys(eventGroup[timestamp]).length})`}
                value={currentEventTimestamp}
                onChange={(timestamp) => {
                  setCurrentClipsTimestamp(null);
                  setCurrentEventTimestamp(timestamp);
                }}
              />
            </FormControl>
            <FormControl>
              <FormControl.Label>
                Clips <CounterLabel>{currentEventTimestamps.length}</CounterLabel>
              </FormControl.Label>
              <Select options={currentEventTimestamps} value={currentClipsTimestamp} onChange={setCurrentClipsTimestamp} />
            </FormControl>
          </Box>
        </Box>
        {/* minWidth for preventing the area grow out of view */}
        <Box as="main" flex="1" minWidth="0">
          {currentClips && (
            <MatrixPlayer
              baseTime={currentClipsTimestamp ? TeslaFS.parseTimestamp(currentClipsTimestamp) : new Date()}
              playSibling={playSibling}
              videos={currentClips}
            />
          )}
        </Box>
      </Box>
    </>
  );
}
