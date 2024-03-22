import { BaseStyles, Box, Header, Heading, Text, ThemeProvider } from "@primer/react";
import { useState } from "react";
import { DashCamBrowser } from "./DashCamBrowser";
import { LoadFilesButton } from "./LoadFilesButton";
import { UsageGuide } from "./UsageGuide";

export function App() {
  const [fileList, setFileList] = useState<FileList | null>(null);

  return (
    <ThemeProvider colorMode="auto">
      <BaseStyles>
        <Box display="flex" flexDirection="column" sx={{ gap: 1 }} bg={"canvas.default"}>
          <Header sx={{ whiteSpace: "nowrap", flexWrap: "wrap" }}>
            <Heading as={"h1"} sx={{ fontSize: 24 }}>
              Tesla Playback
            </Heading>
            <Header.Item full />
            <Header.Item>
              <Text>Made By &nbsp;</Text>
              <Header.Link target="_blank" href="https://github.com/EnixCoda">
                EnixCoda
              </Header.Link>
            </Header.Item>
          </Header>
          <Box as="section" display="inline-flex" flexDirection="column" padding={3} overflow="auto" sx={{ gap: 3 }}>
            <Box>
              <LoadFilesButton
                onLoad={setFileList}
                selectDir
                inputProps={{
                  multiple: true,
                  accept: "video/mp4,video/x-m4v,video/*",
                }}
              >
                Load DashCam Files
              </LoadFilesButton>
            </Box>
            {fileList && fileList.length > 0 ? (
              <DashCamBrowser fileList={fileList} />
            ) : (
              <Box maxWidth={640}>
                <UsageGuide />
              </Box>
            )}
          </Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
