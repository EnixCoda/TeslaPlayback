import { DownloadIcon } from "@primer/octicons-react";
import { Box, Button } from "@primer/react";
import { useMemo } from "react";
import { ExportStateDone, ExportStateIdle } from ".";
import { downloadBlob } from "../../utils/general";

export function ExportDone({ exportState, setExportState }: { exportState: ExportStateDone; setExportState: (state: ExportStateIdle) => void }) {
  const { output } = exportState;
  const videoSrc = useMemo(() => URL.createObjectURL(output), [output]);
  return (
    <Box>
      <video controls autoPlay style={{ width: "100%" }} src={videoSrc} />
      <Box display="flex" justifyContent="space-between">
        <Button
          onClick={() => {
            downloadBlob(output, "output.mp4");
          }}
          leadingVisual={DownloadIcon}
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
    </Box>
  );
}
