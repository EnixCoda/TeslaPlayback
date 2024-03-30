import { Box, Button, Flash } from "@primer/react";
import { DataTable, Table } from "@primer/react/drafts";
import { useMemo } from "react";
import { Dialog } from "./base/Dialog";

export function ParserLogViewer({ parserLog }: { parserLog: { file: File; message: string }[] }) {
  const tableRecords = useMemo(() => parserLog.map(({ file, message }) => ({ id: file.webkitRelativePath, file, message })), [parserLog]);
  return (
    <Box>
      <Flash variant="warning">
        <Box display="inline-flex" alignItems="center" sx={{ gap: 3 }}>
          Some files are ignored.
          <Dialog title="Files ignored" trigger={(io) => <Button onClick={() => io.set(true)}>See details</Button>}>
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
          </Dialog>
        </Box>
      </Flash>
    </Box>
  );
}
