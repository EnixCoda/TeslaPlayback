import { ChevronLeftIcon, ChevronRightIcon, ColumnsIcon, PlayIcon, StopwatchIcon, VersionsIcon } from "@primer/octicons-react";
import { Box, Checkbox, FormControl, IconButton, Text } from "@primer/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { Directions, VideoClipGroup } from "../common";
import { LayoutKey, layoutKeys, useVideosLayout } from "../hooks/useVideosLayout";
import { formatDateTime, formatHMS, shiftTime } from "../utils/general";
import { DropdownSelect } from "./DropdownSelect";
import { LayoutComposer } from "./LayoutComposer";
import { ProgressBar } from "./ProgressBar";
import { Video, VideoRef } from "./Video";
import { VideoExporter } from "./VideoExporter";

const enableExport = window.isSecureContext;

function useVideoControl() {
  const ref = React.useRef<VideoRef | null>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [playEnded, setPlayEnded] = useState(false);
  const [duration, setDuration] = useState(0);
  const [playtime, setPlaytime] = useState(0);
  return {
    ref,
    canPlay,
    setCanPlay,
    playEnded,
    setPlayEnded,
    duration,
    setDuration,
    playtime,
    setPlaytime,
  };
}

export function MatrixPlayer({ baseTime, videos, playSibling }: { baseTime: Date; videos: VideoClipGroup; playSibling?: (offset: 1 | -1) => void }) {
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

  const controls: Record<Directions, ReturnType<typeof useVideoControl>> = {
    front: useVideoControl(),
    back: useVideoControl(),
    left: useVideoControl(),
    right: useVideoControl(),
  };

  // start playing on all can play
  useEffect(() => {
    if ([controls.front.canPlay, controls.back.canPlay, controls.left.canPlay, controls.right.canPlay].every(Boolean)) {
      setIsPlaying(isAutoPlay);
    }
  }, [controls.front.canPlay, controls.back.canPlay, controls.left.canPlay, controls.right.canPlay]);

  // stop play on all ends
  useEffect(() => {
    if ([controls.front.playEnded, controls.back.playEnded, controls.left.playEnded, controls.right.playEnded].some(Boolean)) {
      if (isPlaying && isAutoPlay) {
        playSibling?.(1);
        setProgressBarValue(0);
      }
    }
  }, [controls.front.playEnded, controls.back.playEnded, controls.left.playEnded, controls.right.playEnded]);

  const [playtime, setPlaytime] = useState(0);
  useEffect(() => {
    if ([controls.front.playtime, controls.back.playtime, controls.left.playtime, controls.right.playtime].some(Boolean)) {
      setPlaytime(Math.max(controls.front.playtime, controls.back.playtime, controls.left.playtime, controls.right.playtime));
    }
  }, [controls.front.playtime, controls.back.playtime, controls.left.playtime, controls.right.playtime]);

  const duration = React.useMemo(
    () => Math.max(controls.front.duration, controls.back.duration, controls.left.duration, controls.right.duration),
    [controls.front.duration, controls.back.duration, controls.left.duration, controls.right.duration]
  );

  const playSiblingAndUpdateControl = (offset: 1 | -1) => {
    playSibling?.(offset);
    setPlaytime(0);
    setIsPlaying(isAutoPlay);
    setProgressBarValue(0);
  };

  const shouldContinuePlayingOnDragEnd = React.useRef(false);

  const getVideoProps = (control: ReturnType<typeof useVideoControl>) => ({
    play: isPlaying,
    playbackRate,
    progress: controlledProgress,
    native: {
      autoPlay: isAutoPlay,
      onEnded: () => control.setPlayEnded(true),
      onCanPlay: (e: React.SyntheticEvent<HTMLVideoElement>) => {
        control.setCanPlay(true);
        control.setDuration(e.currentTarget.duration);
      },
      onTimeUpdate: (e: React.SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (video) {
          if (video.readyState >= video.HAVE_METADATA) {
            control.setPlaytime(video.currentTime);
          }
        }
      },
      // onPlay: () => setIsPlaying(true), // disabling along with `onPause`
      // onPause: () => setIsPlaying(false), // This may trigger earlier than `onEnded`
      // onAbort: () => setIsPlaying(false), // This would trigger on switch video source
      // onSuspend: () => setIsPlaying(false), // This would trigger on start playing
    },
  });

  return (
    <Box display="flex" flexDirection="column" border="1px solid transparent" borderColor={"canvas.default"} sx={{ gap: 4 }}>
      <Box display="inline-flex" alignItems="center" sx={{ gap: 3, "> *": { flexShrink: 0 } }} flexWrap="wrap">
        <Box display="inline-flex" alignItems="center" sx={{ gap: 1 }}>
          <IconButton aria-label={"Previous"} onClick={() => playSiblingAndUpdateControl(-1)} icon={ChevronLeftIcon} />
          <IconButton aria-label={isPlaying ? "Pause" : "Play"} onClick={() => setIsPlaying(!isPlaying)} icon={isPlaying ? ColumnsIcon : PlayIcon} />
          <IconButton aria-label={"Next"} onClick={() => playSiblingAndUpdateControl(1)} icon={ChevronRightIcon} />
        </Box>
        <Box display="inline-flex" alignItems="center" flex="1" sx={{ gap: 1 }}>
          <Text fontFamily="mono">
            {formatHMS(playtime)}/{formatHMS(duration)}
          </Text>
          <ProgressBar
            native={{ style: { flex: 1 } }}
            value={progressBarValue}
            onDragStart={() => {
              if (isPlaying) {
                setIsPlaying(false);
              }
              shouldContinuePlayingOnDragEnd.current = isPlaying;
            }}
            onDragEnd={() => {
              if (shouldContinuePlayingOnDragEnd.current) {
                setIsPlaying(true);
              }
            }}
            onChange={(progress) => {
              // on dragging the progress bar dot
              setProgressBarValue(progress); // Update in time for smoother dragging
              setControlledProgress(progress);
            }}
          />
        </Box>
        <Box display="inline-flex" alignItems="center" sx={{ gap: 2 }}>
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
      </Box>
      <Box bg="neutral.muted" position="relative" borderWidth={1} borderStyle="solid" borderColor="border.default" borderRadius={4}>
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
            <Video label={"Front"} ref={controls.front.ref} file={videos.front} {...getVideoProps(controls.front)} />
          </div>
          <div>
            <Video label={"Back"} ref={controls.back.ref} file={videos.back} {...getVideoProps(controls.back)} />
          </div>
          <div>
            <Video label={"Left"} ref={controls.left.ref} file={videos.left} {...getVideoProps(controls.left)} />
          </div>
          <div>
            <Video label={"Right"} ref={controls.right.ref} file={videos.right} {...getVideoProps(controls.right)} />
          </div>
        </LayoutComposer>
        <Box position="absolute" top="0" left="0" p={0} bg="#000" lineHeight="1">
          <Text color="#fff" fontFamily="mono" fontSize="2vw">
            {formatDateTime(shiftTime(baseTime, playtime))}
          </Text>
        </Box>
      </Box>
      {enableExport && <VideoExporter videos={videos} />}
    </Box>
  );
}
