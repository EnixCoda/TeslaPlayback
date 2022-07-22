import { useMemo, useState } from "react";
import { ClipScopeSelect } from "./ClipScopeSelect";
import { PlaybackEventGroup } from "./common";
import { LoadFilesButton } from "./LoadFilesButton";
import { Player } from "./Player";
import { TeslaFS } from "./TeslaFS";
import { TimestampSelect } from "./TimestampSelect";
import { UsageGuide } from "./UsageGuide";
import { useCurrentClipTimestamp } from "./useCurrentClipTimestamp";
import { useCurrentEvent } from "./useCurrentEvent";
import { useLoadSelectedFiles } from "./useLoadSelectedFiles";
import { usePlaySibling } from "./usePlaySibling";

export function App() {
  const [eventGroup, setEventGroup] = useState<PlaybackEventGroup>({});
  const allEventTimestampsOrdered: TeslaFS.Timestamp[] = useMemo(() => Object.keys(eventGroup).sort(), [eventGroup]);
  const loadSelectedFiles = useLoadSelectedFiles(setEventGroup);

  const [clipScope, setClipScope] = useState<TeslaFS.ClipScope>(TeslaFS.clipScopes[0]);

  const { currentEvent, currentEventTimestamp, setCurrentEventTimestamp, currentEventTimestamps } = useCurrentEvent(
    allEventTimestampsOrdered,
    eventGroup
  );

  const { currentClipTimestamp, setCurrentTimestamp, currentPlaybackVideos } = useCurrentClipTimestamp(currentEventTimestamps, currentEvent);

  const playSibling = usePlaySibling(
    allEventTimestampsOrdered,
    currentEventTimestamps,
    currentEventTimestamp,
    setCurrentEventTimestamp,
    currentClipTimestamp,
    setCurrentTimestamp
  );

  return (
    <div>
      <h1>Tesla Playback</h1>

      <LoadFilesButton onLoad={loadSelectedFiles} />
      <nav>
        <ClipScopeSelect value={clipScope} onChange={setClipScope} />
        <div>
          <section>
            <h2>Events</h2>
            <TimestampSelect options={allEventTimestampsOrdered} value={currentEventTimestamp} onChange={setCurrentEventTimestamp} />
          </section>
          <section>
            <h2>Clips</h2>
            <TimestampSelect options={currentEventTimestamps} value={currentClipTimestamp} onChange={setCurrentTimestamp} />
          </section>
        </div>
      </nav>
      <main>{currentPlaybackVideos ? <Player playSibling={playSibling} videos={currentPlaybackVideos} /> : <UsageGuide />}</main>
    </div>
  );
}
