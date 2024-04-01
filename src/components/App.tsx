import { BaseStyles, Box, Header, Heading, Text, ThemeProvider } from "@primer/react";
import { useState } from "react";
import { DashCamBrowser } from "./DashCamBrowser";
import { DemoVideoLoader } from "./DemoVideoLoader";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadFilesButton } from "./LoadFilesButton";
import { UsageGuide } from "./UsageGuide";

export function App() {
  const [fileList, setFileList] = useState<FileListLike | null>(null);

  const loadFilesButton = (
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
  );

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
            <ErrorBoundary>
              {fileList && fileList.length > 0 ? (
                <>
                  <Box>{loadFilesButton}</Box>
                  <DashCamBrowser fileList={fileList} />
                </>
              ) : (
                <Box display="inline-flex" flexDirection="column" maxWidth={640} sx={{ gap: 2 }}>
                  <Text>Browse, view, and export your Tesla DashCam videos for free.</Text>
                  <Box>{loadFilesButton}</Box>
                  <UsageGuide />
                  <DemoVideoLoader setFileList={setFileList} />
                </Box>
              )}
            </ErrorBoundary>
          </Box>
        </Box>
      </BaseStyles>
    </ThemeProvider>
  );
}
