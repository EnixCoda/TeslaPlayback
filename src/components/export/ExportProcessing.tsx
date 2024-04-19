import { Box, Button, ProgressBar, Text } from "@primer/react";
import { useEffect, useState } from "react";
import { ExportStateIdle, ExportStateProcessing } from ".";

interface ProgressEvent {
  progress: number;
  time: number;
}

export function ExportProcessing({
  exportState,
  setExportState,
}: {
  exportState: ExportStateProcessing;
  setExportState: (state: ExportStateIdle) => void;
}) {
  const { ffmpeg, totalTime } = exportState;
  const [progress, setProgress] = useState<ProgressEvent>({
    progress: 0,
    time: 0,
  });
  useEffect(() => {
    const onProgress = (p: ProgressEvent) => {
      setProgress(p);
    };
    ffmpeg.on("progress", onProgress);
    return () => ffmpeg.off("progress", onProgress);
  }, [ffmpeg]);

  const [processedTime, TotalTimeToProcess]: [number, number] = totalTime
    ? [progress.time / 1000000, totalTime]
    : [progress.time / 1000000, progress.time / (progress.progress || 1) / 1000000];

  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ gap: 2 }}>
        <ProgressBar sx={{ flex: 1 }} animated progress={(processedTime / TotalTimeToProcess) * 100} />
        <Text>
          {processedTime.toFixed(1)}s / {TotalTimeToProcess.toFixed(1)}s
        </Text>
        <Button
          onClick={() => {
            ffmpeg.terminate();
            setExportState({ state: "idle" });
          }}
        >
          Cancel
        </Button>
      </Box>
    </Box>
  );
}
