import { BaseStyles, Box, CounterLabel, Header, Heading, ThemeProvider } from "@primer/react";
import { useEffect, useMemo, useState } from "react";
import { ClipCategorizedEvents, PlaybackEventGroup } from "./common";
import { LoadFilesButton } from "./LoadFilesButton";
import { Player } from "./Player";
import { SubNavs } from "./SubNavs";
import { TeslaFS } from "./TeslaFS";
import { TimestampSelect } from "./TimestampSelect";
import { UsageGuide } from "./UsageGuide";
import { useCurrentEventClips } from "./useCurrentClipTimestamp";
import { useCurrentEvent } from "./useCurrentEvent";
import { useLoadSelectedFiles } from "./useLoadSelectedFiles";
import { usePlaySibling } from "./usePlaySibling";
import { getSortedKeys } from "./utils";

export function App() {
  const [allEventGroup, setAllEventGroup] = useState<PlaybackEventGroup>({});
  const [scopeMap, setScopeMap] = useState<ClipCategorizedEvents>({});
  const availableScopes = useMemo(() => TeslaFS.clipScopes.filter((scope) => !!scopeMap[scope]?.length), [scopeMap]);
  const [focusedScope, setFocusedScope] = useState<TeslaFS.ClipScope | null>(null);
  useEffect(() => {
    setFocusedScope(availableScopes[0] || null);
  }, [availableScopes]);

  const eventGroup: PlaybackEventGroup = useMemo(() => {
    if (focusedScope === null) return allEventGroup;
    const map = scopeMap[focusedScope];
    if (!map || !map.length) return allEventGroup;
    const eventGroup: PlaybackEventGroup = {};
    map.forEach((timestamps) => {
      eventGroup[timestamps] = allEventGroup[timestamps];
    });
    return eventGroup;
  }, [allEventGroup, focusedScope]);
  const allEventTimestampsOrdered = useMemo(() => getSortedKeys(eventGroup), [eventGroup]);
  const loadSelectedFiles = useLoadSelectedFiles(setAllEventGroup, setScopeMap);
  const { currentEvent, currentEventTimestamp, setCurrentEventTimestamp, currentEventTimestamps } = useCurrentEvent(
    allEventTimestampsOrdered,
    eventGroup
  );

  const { currentClipsTimestamp, setCurrentClipsTimestamp, currentClips } = useCurrentEventClips(currentEvent);

  const playSibling = usePlaySibling(eventGroup, currentEventTimestamp, setCurrentEventTimestamp, currentClipsTimestamp, setCurrentClipsTimestamp);

  return (
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <Box display="flex" flexDirection="column" sx={{ gap: 1 }} bg={"canvas.default"}>
          <Header>
            <Heading as={"h1"} sx={{ fontSize: 24 }}>
              Tesla Playback
            </Heading>
          </Header>
          <Box display="flex" flexDirection={["column", "column", "row"]} sx={{ gap: 1 }} m={2}>
            <Box as="section" display="flex" flexDirection="column" sx={{ flexShrink: 0, flexGrow: 0, gap: 3 }}>
              <Box>
                <LoadFilesButton onLoad={loadSelectedFiles} />
              </Box>
              {allEventTimestampsOrdered.length > 0 ? (
                <Box as="nav" display="flex" flexDirection="column" width={380} sx={{ gap: 2 }}>
                  {availableScopes.length > 0 && (
                    <SubNavs options={availableScopes} value={focusedScope} onChange={(scope) => setFocusedScope(scope)} />
                  )}
                  <Box display="flex" sx={{ gap: 1 }}>
                    <section>
                      <Heading as={"h2"} sx={{ fontSize: 2 }}>
                        Events <CounterLabel>{allEventTimestampsOrdered.length}</CounterLabel>
                      </Heading>
                      <TimestampSelect
                        options={allEventTimestampsOrdered}
                        value={currentEventTimestamp}
                        onChange={(timestamp) => {
                          setCurrentClipsTimestamp(null);
                          setCurrentEventTimestamp(timestamp);
                        }}
                      />
                    </section>
                    <section>
                      <Heading as={"h2"} sx={{ fontSize: 2 }}>
                        Clips <CounterLabel>{currentEventTimestamps.length}</CounterLabel>
                      </Heading>
                      <TimestampSelect options={currentEventTimestamps} value={currentClipsTimestamp} onChange={setCurrentClipsTimestamp} />
                    </section>
                  </Box>
                </Box>
              ) : (
                <Box width={640}>
                  <UsageGuide />
                </Box>
              )}
            </Box>
            {currentClips && (
              <Box as="main">
                <Player playSibling={playSibling} videos={currentClips} />
              </Box>
            )}
          </Box>
          <Box as="footer">CopyRight</Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
