import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Button } from "@primer/react";
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

export type ExportState = ExportStateIdle | ExportStateProcessing | ExportStateDone | ExportStateFail;

export const VideoExporter = memo(function VideoExporter({ videos }: { videos: VideoClipGroup }) {
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
    >
      {run(() => {
        switch (exportState.state) {
          case "idle":
            return <ExportIdle {...{ videos, exportState, setExportState }} />;
          case "processing":
            return <ExportProcessing {...{ exportState, setExportState }} />;
          case "done":
            return <ExportDone {...{ exportState, setExportState }} />;
          case "fail":
            return <ExportFail exportState={exportState} setExportState={setExportState} />;
        }
      })}
    </Dialog>
  );
});
