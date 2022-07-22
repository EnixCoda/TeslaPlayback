import * as React from "react";
import { useEffect, useState } from "react";
import { VideoGroup } from "./common";
import { DropdownSelect } from "./DropdownSelect";
import { LayoutComposer } from "./LayoutComposer";
import { ProgressBar } from "./ProgressBar";
import { LayoutKey, layoutKeys, useVideosLayout } from "./useVideosLayout";
import { formatHMS } from "./utils";
import { Video } from "./Video";

export function Player({ videos, playSibling }: { videos: VideoGroup; playSibling: (offset: 1 | -1) => void }) {
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

  return (
    <div>
      <section>
        <h2>Play control</h2>
        <button
          type="button"
          onClick={() => {
            playSibling(-1);
            setPlaytime(0);
            setIsPlaying(isAutoPlay);
            setProgressBarValue(0);
          }}
        >
          {"<"}
        </button>
        <button
          type="button"
          onClick={() => {
            setIsPlaying(!isPlaying);
          }}
        >
          {isPlaying ? "⏸" : "▶️"}
        </button>
        <button
          type="button"
          onClick={() => {
            playSibling(1);
            setPlaytime(0);
            setIsPlaying(isAutoPlay);
            setProgressBarValue(0);
          }}
        >
          {">"}
        </button>
        <span>
          {formatHMS(playtime)}/{formatHMS(duration)}
        </span>
        <ProgressBar
          value={progressBarValue}
          onChange={(progress) => {
            // on dragging the progress bar dot
            if (isPlaying) setIsPlaying(false);
            setProgressBarValue(progress); // Update in time for smoother dragging
            setControlledProgress(progress);
          }}
        />
        <DropdownSelect
          title={"Playback Rate:"}
          options={[0.25, 0.5, 1, 2, 4, 8].map((rate) => ({
            value: `${rate}`,
            label: `${rate}x`,
          }))}
          value={`${playbackRate}`}
          onChange={(value) => setPlaybackRate(parseFloat(value))}
        />
        <DropdownSelect
          title={"Layout:"}
          options={layoutKeys.map((key) => ({
            value: key,
            label: key,
          }))}
          value={layoutKey}
          onChange={setLayoutKey}
        />
        <label>
          <input type="checkbox" checked={isAutoPlay} onChange={() => setIsAutoPlay(!isAutoPlay)} />
          Auto Play
        </label>
      </section>
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
                  playSibling(1);
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
    </div>
  );
}
