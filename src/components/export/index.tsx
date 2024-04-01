import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Box, Button, Text } from "@primer/react";
import { memo, useState } from "react";
import { VideoClipGroup } from "../../common";
import { run } from "../../utils/general";
import { Dialog } from "../base/Dialog";
import { ExportDone } from "./ExportDone";
import { ExportFail } from "./ExportFail";
import { ExportIdle } from "./ExportIdle";
import { ExportProcessing } from "./ExportProcessing";

export type ExportStateIdle = {
  state: "idle";
};
export type ExportStateLoadingFFMpeg = {
  state: "loadingFFMpeg";
};
export type ExportStateProcessing = {
  state: "processing";
  ffmpeg: FFmpeg;
  totalTime?: number;
};
export type ExportStateDone = {
  state: "done";
  output: Blob;
};
export type ExportStateFail = {
  state: "fail";
  reason: string;
};

export type ExportState = ExportStateIdle | ExportStateLoadingFFMpeg | ExportStateProcessing | ExportStateDone | ExportStateFail;

export const VideoExporter = memo(function VideoExporter({
  totalTime,
  videos,
  videoPlayControl,
}: {
  totalTime: number;
  videos: VideoClipGroup;
  videoPlayControl?: {
    play?: () => void;
    pause?: () => void;
    setPlaytime?: (time: number) => void;
    setPlaybackRate?: (rate: number) => void;
    setProgressBarValue?: (value: number) => void;
    setControlledProgress?: (value: number) => void;
  };
}) {
  const [exportState, setExportState] = useState<ExportState>({
    state: "idle",
  });

  return (
    <Dialog<HTMLButtonElement>
      trigger={(isOpen, ref) => (
        <Button ref={ref} onClick={() => isOpen.set(true)}>
          Export current event
        </Button>
      )}
      title="Export"
      onChangeIsOpen={(isOpen) => {
        if (isOpen) videoPlayControl?.pause?.();
      }}
    >
      <Box
        display={
          /* To restore state after exporting */
          exportState.state === "idle" ? undefined : "none"
        }
      >
        <ExportIdle videos={videos} totalTime={totalTime} setExportState={setExportState} />
      </Box>
      {run(() => {
        switch (exportState.state) {
          case "loadingFFMpeg":
            return <Text>Loading plugins for exporting video...</Text>;
          case "processing":
            return <ExportProcessing exportState={exportState} setExportState={setExportState} />;
          case "done":
            return <ExportDone exportState={exportState} setExportState={setExportState} />;
          case "fail":
            return <ExportFail exportState={exportState} setExportState={setExportState} />;
        }
      })}
    </Dialog>
  );
});
