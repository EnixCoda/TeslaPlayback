import { ChevronLeftIcon, ChevronRightIcon, ColumnsIcon, PlayIcon, StopwatchIcon, VersionsIcon } from "@primer/octicons-react";
import { Box, Button, Checkbox, FormControl, IconButton, ProgressBar as PrimerProgressBar, Text } from "@primer/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { TeslaFS } from "../TeslaFS";
import { VideoGroup } from "../common";
import { LayoutKey, layoutKeys, useVideosLayout } from "../hooks/useVideosLayout";
import { addTimestampToVideo, drawTextToVideo, mergeVideos } from "../utils/exportVideo";
import { downloadBlob, formatHMS } from "../utils/general";
import { DropdownSelect } from "./DropdownSelect";
import { LayoutComposer } from "./LayoutComposer";
import { ProgressBar } from "./ProgressBar";
import { Video } from "./Video";

const enableExport = window.isSecureContext;

export function Player({ videos, playSibling }: { videos: VideoGroup; playSibling?: (offset: 1 | -1) => void }) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(isPlaying); // should equal on initial
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  const [progressBarValue, setProgressBarValue] = useState(0); // This stores progress from video and updates progress bar
  const [controlledProgress, setControlledProgress] = useState(progressBarValue); // update this to control video progress programmatically
  useEffect(() => {
    if (controlledProgress !== progressBarValue) {
      setProgressBarValue(controlledProgress);
    }
  }, [controlledProgress]);

  const [layoutKey, setLayoutKey] = useState<LayoutKey>("1/2/1");
  const layout = useVideosLayout(layoutKey, 3 / 4);

  const [playtime, setPlaytime] = useState(0);
  const [duration, setDuration] = useState(0);

  const playSiblingAndUpdateControl = React.useCallback(
    function playSiblingAndUpdateControl(offset: 1 | -1) {
      playSibling?.(offset);
      setPlaytime(0);
      setIsPlaying(isAutoPlay);
      setProgressBarValue(0);
    },
    [isAutoPlay, playSibling]
  );

  const [convertProgress, setConvertProgress] = useState(0);
  const shouldRestore = React.useRef(false);

  return (
    <Box display="flex" flexDirection="column" border="1px solid transparent" borderColor={"canvas.default"} sx={{ gap: 4 }}>
      <Box display="flex" alignItems="center" sx={{ gap: 1 }}>
        <IconButton onClick={() => playSiblingAndUpdateControl(-1)} icon={ChevronLeftIcon} />
        <IconButton onClick={() => setIsPlaying(!isPlaying)} icon={isPlaying ? ColumnsIcon : PlayIcon} />
        <IconButton onClick={() => playSiblingAndUpdateControl(1)} icon={ChevronRightIcon} />
        <Text sx={{ fontFamily: "monospace" }}>
          {formatHMS(playtime)}/{formatHMS(duration)}
        </Text>
        <ProgressBar
          native={{ style: { flex: 1 } }}
          value={progressBarValue}
          onDragStart={() => {
            if (isPlaying) {
              setIsPlaying(false);
            }
            shouldRestore.current = isPlaying;
          }}
          onDragEnd={() => {
            if (shouldRestore.current) {
              setIsPlaying(true);
            }
          }}
          onChange={(progress) => {
            // on dragging the progress bar dot
            setProgressBarValue(progress); // Update in time for smoother dragging
            setControlledProgress(progress);
          }}
        />
        <DropdownSelect
          title={
            <>
              <StopwatchIcon /> {`x${playbackRate}`}
            </>
          }
          options={[0.25, 0.5, 1, 2, 4, 8].map((rate) => ({
            value: `${rate}`,
            label: `${rate}`,
          }))}
          value={`${playbackRate}`}
          onChange={(value) => setPlaybackRate(parseFloat(value))}
        />
        <DropdownSelect
          title={
            <>
              <VersionsIcon /> {layoutKey}
            </>
          }
          options={layoutKeys.map((key) => ({
            value: key,
            label: key,
          }))}
          value={layoutKey}
          onChange={setLayoutKey}
        />
        <FormControl sx={{ alignItems: "center" }}>
          <Checkbox checked={isAutoPlay} onChange={() => setIsAutoPlay(!isAutoPlay)} />
          <FormControl.Label sx={{ whiteSpace: "nowrap" }}>Auto Play</FormControl.Label>
        </FormControl>
      </Box>
      {enableExport && (
        <>
          <Button
            onClick={async () => {
              if (videos.front && videos.back) {
                const outputFile = await mergeVideos(videos.front, videos.back, (p) => setConvertProgress(p.progress));
                typeof outputFile === "string" ? console.log({ outputFile }) : downloadBlob(outputFile, "output.mp4", 'video/mp4; codecs="mp4s"');
              }
            }}
          >
            Merge & Export
          </Button>
          <Button
            onClick={async () => {
              if (videos.front) {
                const outputFile = await addTimestampToVideo(videos.front, TeslaFS.parseFileNameDate(videos.front.name), (p) =>
                  setConvertProgress(p.progress)
                );
                typeof outputFile === "string" ? console.log({ outputFile }) : downloadBlob(outputFile, "output.mp4", 'video/mp4; codecs="mp4s"');
              }
            }}
          >
            Timestamp & Export
          </Button>
          <Button
            onClick={async () => {
              if (videos.front) {
                const outputFile = await drawTextToVideo(videos.front, (p) => setConvertProgress(p.progress));
                typeof outputFile === "string" ? console.log({ outputFile }) : downloadBlob(outputFile, "output.mp4", 'video/mp4; codecs="mp4s"');
              }
            }}
          >
            Draw Text & Export
          </Button>
          <PrimerProgressBar progress={convertProgress * 100} />
        </>
      )}
      <Box bg="neutral.muted" borderWidth={1} borderStyle="solid" borderColor="border.default" borderRadius={4}>
        <LayoutComposer
          style={layout.container}
          decorator={(index, element) =>
            React.cloneElement(element, {
              ...element.props,
              style: {
                ...element.props.style,
                ...layout.children[index],
              },
            })
          }
        >
          <div>
            <Video
              title={"Front"}
              file={videos.front}
              play={isPlaying}
              playbackRate={playbackRate}
              progress={controlledProgress}
              native={{
                autoPlay: isAutoPlay,
                onTimeUpdate: (e) => {
                  const video = e.currentTarget;
                  if (video) {
                    if (video.readyState >= video.HAVE_METADATA) {
                      const progress = video.currentTime / video.duration;
                      setPlaytime(video.currentTime);
                      setProgressBarValue(progress);
                    }
                  }
                },
                onCanPlay: (e) => setDuration(e.currentTarget.duration),
                // onPlay: () => setIsPlaying(true), // disabling along with `onPause`
                // onPause: () => setIsPlaying(false), // This may trigger earlier than `onEnded`
                // onAbort: () => setIsPlaying(false), // This would trigger on switch video source
                // onSuspend: () => setIsPlaying(false), // This would trigger on start playing
                onEnded: () => {
                  // Prevent playing next when dragging the progress bar
                  if (isPlaying && isAutoPlay) {
                    playSibling?.(1);
                    setProgressBarValue(0);
                  }
                },
              }}
            />
          </div>
          <div>
            <Video
              title={"Back"}
              file={videos.back}
              play={isPlaying}
              playbackRate={playbackRate}
              progress={controlledProgress}
              native={{
                autoPlay: isAutoPlay,
              }}
            />
          </div>
          <div>
            <Video
              title={"Left"}
              file={videos.left}
              play={isPlaying}
              playbackRate={playbackRate}
              progress={controlledProgress}
              native={{
                autoPlay: isAutoPlay,
              }}
            />
          </div>
          <div>
            <Video
              title={"Right"}
              file={videos.right}
              play={isPlaying}
              playbackRate={playbackRate}
              progress={controlledProgress}
              native={{
                autoPlay: isAutoPlay,
              }}
            />
          </div>
        </LayoutComposer>
      </Box>
    </Box>
  );
}
