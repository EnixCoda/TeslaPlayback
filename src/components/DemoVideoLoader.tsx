import { Box, Button, Text } from "@primer/react";
import { useEffect, useState } from "react";
import back from "../../demo/RecentClips/2024-04-16_10-10-22-back.mp4";
import front from "../../demo/RecentClips/2024-04-16_10-10-22-front.mp4";
import leftRepeater from "../../demo/RecentClips/2024-04-16_10-10-22-left_repeater.mp4";
import rightRepeater from "../../demo/RecentClips/2024-04-16_10-10-22-right_repeater.mp4";
import { run } from "../utils/general";

const loadDemoVideoFile = (importUrl: string, filePath = importUrl): Promise<File> =>
  fetch(importUrl)
    .then((r) => r.blob())
    .then((blob) => new File([blob], filePath.split("/").pop()!, { type: "video/mp4" }))
    .then((file) => {
      Object.defineProperty(file, "webkitRelativePath", {
        get: () => importUrl,
      });
      return file;
    });

const demoFileUrls: string[] = [front, back, leftRepeater, rightRepeater];

export function DemoVideoLoader({ setFileList }: { setFileList: (fileList: FileListLike) => void }) {
  const [[filesLoaded, filesToLoad], setLoadDemoFilesProgress] = useState<[File[], string[]]>([[], []]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    const cancel = () => {
      aborted = true;
    };
    run(async () => {
      try {
        setError(null);
        const fileList = await Promise.all(
          filesToLoad.map(async (path) => {
            const file = await loadDemoVideoFile(path);
            setLoadDemoFilesProgress(([loaded, totalToLoad]) => [loaded.concat(file), totalToLoad]);
            return file;
          })
        );
        if (aborted) return;
        setFileList(fileList);
      } catch (error) {
        if (aborted) return;
        console.error(error);
        setError(`Failed loading demo videos.`);
      }
    });

    return () => cancel();
  }, [filesToLoad, setFileList]);

  if (demoFileUrls.length === 0) return null;
  return (
    <Box>
      <Button onClick={() => setLoadDemoFilesProgress([[], demoFileUrls])}>Try with demo files</Button>
      {filesToLoad.length > 0 && (
        <Text>
          Loading demo video files: {filesLoaded.length}/{filesToLoad.length}
        </Text>
      )}
      {error !== null && <Text>Something went wrong: {error}</Text>}
    </Box>
  );
}
