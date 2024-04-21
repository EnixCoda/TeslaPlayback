import { Box, Button, Text } from "@primer/react";
import { useEffect, useState } from "react";
import { dataURLtoFile, run } from "../utils/general";

const loadDemoVideoFile = (videoUrl: string, filePath: string): Promise<File> =>
  Promise.resolve(
    videoUrl.startsWith("data:video/mp4;base64,")
      ? dataURLtoFile(videoUrl, filePath.split("/").pop()!)
      : fetch(videoUrl)
          .then((r) => r.blob())
          .then((blob) => new File([blob], filePath.split("/").pop()!, { type: "video/mp4" }))
  ).then((file) => {
    Object.defineProperty(file, "webkitRelativePath", {
      value: filePath,
    });
    return file;
  });

type DemoFileLoader = () => File | Promise<File>;

const demoFileLoaders = (): DemoFileLoader[] => [
  () => import("../../demo/2024-04-16_10-10-22-back.mp4").then((m) => loadDemoVideoFile(m.default, "2024-04-16_10-10-22-back.mp4")),
  () => import("../../demo/2024-04-16_10-10-22-front.mp4").then((m) => loadDemoVideoFile(m.default, "2024-04-16_10-10-22-front.mp4")),
  () => import("../../demo/2024-04-16_10-10-22-left_repeater.mp4").then((m) => loadDemoVideoFile(m.default, "2024-04-16_10-10-22-left_repeater.mp4")),
  () =>
    import("../../demo/2024-04-16_10-10-22-right_repeater.mp4").then((m) => loadDemoVideoFile(m.default, "2024-04-16_10-10-22-right_repeater.mp4")),
];

export function DemoVideoLoader({ setFileList }: { setFileList: (fileList: FileListLike) => void }) {
  const [[filesLoaded, filesToLoad], setLoadDemoFilesProgress] = useState<[File[], DemoFileLoader[]]>([[], []]);
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
          filesToLoad.map(async (load) => {
            const file = await load();
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

  if (demoFileLoaders.length === 0) return null;

  return (
    <Box>
      <Button onClick={() => setLoadDemoFilesProgress([[], demoFileLoaders()])}>Try with demo files</Button>
      {filesToLoad.length > 0 && (
        <Text>
          Loading demo video files: {filesLoaded.length}/{filesToLoad.length}
        </Text>
      )}
      {error !== null && <Text>Something went wrong: {error}</Text>}
    </Box>
  );
}
