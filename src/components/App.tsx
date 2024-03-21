import { BaseStyles, Box, CounterLabel, Header, Heading, ThemeProvider } from "@primer/react";
import { useEffect, useMemo, useState } from "react";
import { TeslaFS } from "../TeslaFS";
import { ClipCategorizedEvents, PlaybackEventGroup } from "../common";
import { useCurrentEventClips } from "../hooks/useCurrentClipTimestamp";
import { useCurrentEvent } from "../hooks/useCurrentEvent";
import { useLoadSelectedFiles } from "../hooks/useLoadSelectedFiles";
import { usePlaySibling } from "../hooks/usePlaySibling";
import { getSortedKeys } from "../utils/general";
import { LoadFilesButton } from "./LoadFilesButton";
import { Player } from "./Player";
import { SubNavs } from "./SubNavs";
import { TimestampSelect } from "./TimestampSelect";
import { UsageGuide } from "./UsageGuide";

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
            <Header.Item full />
            <Header.Item>
              Made By &nbsp;
              <Header.Link target="_blank" href="https://github.com/EnixCoda">
                EnixCoda
              </Header.Link>
            </Header.Item>
          </Header>
          <Box display="flex" flexDirection={["column", "column", "row"]} sx={{ gap: 1 }} m={3} pb={2} overflow="auto">
            <Box as="section" display="flex" flexDirection="column" sx={{ flexShrink: 0, flexGrow: 0, gap: 3 }}>
              <Box>
                <LoadFilesButton
                  onLoad={loadSelectedFiles}
                  selectDir
                  inputProps={{
                    multiple: true,
                    accept: "video/mp4,video/x-m4v,video/*",
                  }}
                />
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
                        sx={{ maxHeight: 600, overflowY: "auto" }}
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
                      <TimestampSelect
                        sx={{ maxHeight: 600 }}
                        options={currentEventTimestamps}
                        value={currentClipsTimestamp}
                        onChange={setCurrentClipsTimestamp}
                      />
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
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
