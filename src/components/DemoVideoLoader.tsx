import { Box, Button, ProgressBar, Text } from "@primer/react";
import { useState } from "react";

const loadDemoVideoFile = (importUrl: string, filePath = importUrl, onFileLoaded?: (file: File) => void): Promise<File> =>
  fetch(importUrl)
    .then((r) => r.blob())
    .then((blob) => new File([blob], filePath.split("/").pop()!, { type: "video/mp4" }))
    .then((file) => {
      Object.defineProperty(file, "webkitRelativePath", {
        get: () => importUrl,
      });
      onFileLoaded?.(file);
      return file;
    });

export function DemoVideoLoader({ setFileList }: { setFileList: (fileList: FileListLike) => void }) {
  const [[loaded, totalToLoad], setLoadDemoFilesProgress] = useState<[number, number]>([0, 0]);
  return (
    <Box>
      <Button
        onClick={async () => {
          const filesToLoad: string[] = [];
          function loadDemoVideoFiles(onFileLoaded?: (file: File) => void) {
            return Promise.all(filesToLoad.map((path) => loadDemoVideoFile(path, path, onFileLoaded)));
          }

          setLoadDemoFilesProgress([0, filesToLoad.length]);
          setFileList(
            await loadDemoVideoFiles(() => {
              setLoadDemoFilesProgress(([loaded, totalToLoad]) => [loaded + 1, totalToLoad]);
            })
          );
        }}
      >
        Try with demo files
      </Button>
      {totalToLoad > 0 && (
        <>
          <Text>Fetching demo video files:</Text>
          <ProgressBar progress={(loaded / totalToLoad) * 100} />
        </>
      )}
    </Box>
  );
}
