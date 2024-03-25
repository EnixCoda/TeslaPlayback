import { Box, Button, Text } from "@primer/react";
import { ExportStateFail, ExportStateIdle } from ".";

export function ExportFail({ exportState, setExportState }: { exportState: ExportStateFail; setExportState: (state: ExportStateIdle) => void }) {
  return (
    <Box>
      <Text>{exportState.reason}</Text>
      <Button
        onClick={() => {
          setExportState({ state: "idle" });
        }}
      >
        OK
      </Button>
    </Box>
  );
}
