import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Box, Button, ProgressBar as PrimerProgressBar, Text } from "@primer/react";
import { useState } from "react";
import { TeslaFS } from "../TeslaFS";
import { VideoGroup } from "../common";
import { addTimestampToVideo, drawTextToVideo, mergeVideos } from "../utils/exportVideo";
import { downloadBlob, getBlob, run } from "../utils/general";

export function VideoExporter({ videos }: { videos: VideoGroup }) {
  type ExportStateIdle = {
    state: "idle";
  };
  type ExportStateProcessing = {
    state: "processing";
    ffmpeg: FFmpeg;
  };
  type ExportStateDone = {
    state: "done";
    output: Blob;
  };

  type ExportState = ExportStateIdle | ExportStateProcessing | ExportStateDone;

  const [exportState, setExportState] = useState<ExportState>({
    state: "idle",
  });
  const [convertProgress, setConvertProgress] = useState(0);

  async function processVideos(processor: (hook: (ffmpeg: FFmpeg) => void) => ReturnType<FFmpeg["readFile"]>) {
    try {
      const outputFile = await processor((ffmpeg) => {
        ffmpeg.on("progress", (p) => setConvertProgress(p.progress));
      });
      if (typeof outputFile === "string") console.log({ outputFile });
      else setExportState({ state: "done", output: getBlob(outputFile, "video/mp4") });
    } catch (err) {
      alert("Failed processing video");
      console.error(err);
      setExportState({ state: "idle" });
    }
  }

  return (
    <>
      {run(() => {
        switch (exportState?.state) {
          case "idle": {
            return (
              <Box>
                <Button
                  onClick={async () => {
                    const { front, back } = videos;
                    if (front && back) processVideos((hook) => mergeVideos(hook, front, back));
                  }}
                >
                  Merge & Export
                </Button>
                <Button
                  onClick={async () => {
                    const { front } = videos;
                    if (front) processVideos((hook) => addTimestampToVideo(hook, front, TeslaFS.parseFileNameDate(front.name)));
                  }}
                >
                  Timestamp & Export
                </Button>
                <Button
                  onClick={async () => {
                    const { front } = videos;
                    if (front) processVideos((hook) => drawTextToVideo(hook, front));
                  }}
                >
                  Draw Text & Export
                </Button>
              </Box>
            );
          }
          case "processing": {
            const { ffmpeg } = exportState;
            return (
              <Box>
                <Text>{(convertProgress * 100).toFixed(1) + "%"}</Text>
                <PrimerProgressBar progress={convertProgress * 100} />
                <Button
                  onClick={() => {
                    ffmpeg.terminate();
                    setExportState({ state: "idle" });
                  }}
                >
                  Cancel
                </Button>
              </Box>
            );
          }
          case "done": {
            const { output } = exportState;
            return (
              <Box>
                <video src={URL.createObjectURL(output)} />
                <Button
                  onClick={() => {
                    downloadBlob(output, "output.mp4");
                  }}
                >
                  Download
                </Button>
                <Button
                  onClick={() => {
                    setExportState({ state: "idle" });
                  }}
                >
                  Done
                </Button>
              </Box>
            );
          }
        }
      })}
    </>
  );
}
