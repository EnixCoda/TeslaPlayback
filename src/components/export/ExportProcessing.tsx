import { ProgressEvent } from "@ffmpeg/ffmpeg/types";
import { Box, Button, ProgressBar as PrimerProgressBar, Text } from "@primer/react";
import { useEffect, useState } from "react";
import { ExportStateIdle, ExportStateProcessing } from ".";

export function ExportProcessing({
  exportState,
  setExportState,
}: {
  exportState: ExportStateProcessing;
  setExportState: (state: ExportStateIdle) => void;
}) {
  const { ffmpeg } = exportState;
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

  return (
    <Box>
      <Box display="flex" alignItems="center" sx={{ gap: 2 }}>
        <PrimerProgressBar sx={{ flex: 1 }} progress={progress.progress * 100} />
        <Text>
          {(progress.time / 1000000).toFixed(1) + "s"}/{(progress.time / (progress.progress || 1) / 1000000).toFixed(1) + "s"}
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
