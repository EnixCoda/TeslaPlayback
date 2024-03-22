import { Box, Button, Dialog, Flash } from "@primer/react";
import { DataTable, Table } from "@primer/react/drafts";
import { createRef, useMemo, useState } from "react";

export function ParserLogViewer({ parserLog }: { parserLog: { file: File; message: string }[] }) {
  const tableRecords = useMemo(() => parserLog.map(({ file, message }) => ({ id: file.webkitRelativePath, file, message })), [parserLog]);
  const [isDetailsShown, setIsDetailsShown] = useState(false);
  const returnFocusRef = createRef<HTMLButtonElement>();
  return (
    <Box>
      <Flash variant="warning">
        <Box display="inline-flex" alignItems="center" sx={{ gap: 3 }}>
          Some files are ignored.
          <Button ref={returnFocusRef} onClick={() => setIsDetailsShown(!isDetailsShown)}>
            See details
          </Button>
        </Box>
      </Flash>

      <Dialog
        returnFocusRef={returnFocusRef}
        isOpen={isDetailsShown}
        onDismiss={() => setIsDetailsShown(false)}
        sx={{
          width: ["100vw", "100vw", "80vw"],
          height: ["100vh", "100vh", "80vh"],
          maxHeight: ["100vh", "100vh", "80vh"],
        }}
      >
        <Dialog.Header>Files ignored</Dialog.Header>
        <Box padding={3}>
          <Table.Container>
            <DataTable
              data={tableRecords}
              columns={[
                {
                  header: "File",
                  field: "file.webkitRelativePath",
                  rowHeader: true,
                },
                {
                  header: "Description",
                  field: "message",
                },
              ]}
            />
          </Table.Container>
        </Box>
      </Dialog>
    </Box>
  );
}
