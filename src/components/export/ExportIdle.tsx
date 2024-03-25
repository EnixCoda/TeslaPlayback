import { FFmpeg } from "@ffmpeg/ffmpeg";
import { Box, Button, Checkbox, CheckboxGroup, FormControl, Text, TextInput } from "@primer/react";
import { useState } from "react";
import { ExportState } from ".";
import { TeslaFS } from "../../TeslaFS";
import { VideoClipGroup } from "../../common";
import { addTimestampToVideo, drawTextToVideo, mergeVideos } from "../../utils/exportVideo";
import { getBlob } from "../../utils/general";
import { w } from "../../utils/w";

export function ExportIdle({ setExportState, videos }: { setExportState: (state: ExportState) => void; videos: VideoClipGroup }) {
  async function processVideos(processor: (hook: (ffmpeg: FFmpeg) => void) => ReturnType<FFmpeg["readFile"]>) {
    try {
      const outputFile = await processor((ffmpeg) => {
        setExportState({ state: "processing", ffmpeg });
      });
      if (typeof outputFile === "string") {
        setExportState({
          state: "fail",
          reason: `ffmpeg emitted a string output: ${outputFile}`,
        });
        console.error({ outputFile });
      } else {
        setExportState({ state: "done", output: getBlob(outputFile, "video/mp4") });
      }
    } catch (err) {
      if (err instanceof Error) {
        switch (err.message) {
          case "called FFmpeg.terminate()":
            return;
          case "Failed to execute 'postMessage' on 'Worker': ArrayBuffer at index 0 is already detached.":
            setExportState({ state: "fail", reason: "Failed to relaunch Web Worker. Please refresh and retry." });
            return;
          default:
            console.error(err);
            setExportState({ state: "fail", reason: err.message });
            return;
        }
      }
      console.error(err);
      setExportState({ state: "fail", reason: `Failed processing video: ${err}` });
    }
  }

  const chain =
    <T, R>(check: () => T | undefined, exec: (i2: T) => R): (() => undefined | (() => R)) =>
    () =>
      w(check())((e) => e && (() => exec(e)));

  const startConvert = () => {
    for (const mode of selectedModes) {
      const conversion = conversions[mode]();
      if (conversion) {
        return conversion();
      }
    }
  };

  const conversions = {
    addTimestamp: chain(
      () => {
        const { front } = videos;
        if (front) return { front };
      },
      ({ front }) => processVideos((hook) => addTimestampToVideo(hook, front, TeslaFS.parseFileNameDate(front.name)))
    ),
    merge: chain(
      () => {
        const { front, back } = videos;
        if (front && back) return { front, back };
      },
      ({ front, back }) => processVideos((hook) => mergeVideos(hook, front, back))
    ),
    drawText: chain(
      () => {
        const { front } = videos;
        if (front) return { front };
      },
      ({ front }) => processVideos((hook) => drawTextToVideo(hook, front, textToDraw))
    ),
  };

  const [selectedModes, setSelectedModes] = useState<(keyof typeof conversions)[]>(["addTimestamp"]);
  const [textToDraw, setTextToDraw] = useState("");

  return (
    <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
      <CheckboxGroup onChange={(modes) => setSelectedModes(modes as (keyof typeof conversions)[])}>
        <FormControl>
          <Checkbox value="addTimestamp" checked={selectedModes.includes("addTimestamp")} />
          <FormControl.Label>Add timestamp</FormControl.Label>
          <FormControl.Caption>
            Add timestamp to the video. The timestamp will be the date of the video file. The timestamp will be added to the top left corner of the
            video.
          </FormControl.Caption>
        </FormControl>
        <FormControl>
          <Checkbox value="drawText" checked={selectedModes.includes("drawText")} />
          <FormControl.Label>Draw Text</FormControl.Label>
          <FormControl.Caption>
            <TextInput
              disabled={!selectedModes.includes("drawText")}
              value={textToDraw}
              onChange={(e) => setTextToDraw(e.target.value)}
              placeholder="Enter text to draw"
            />
          </FormControl.Caption>
        </FormControl>
        <FormControl disabled>
          <Checkbox value="merge" checked={selectedModes.includes("merge")} />
          <FormControl.Label>Merge all cams into one (upcoming feature)</FormControl.Label>
        </FormControl>
        <FormControl disabled>
          <Checkbox value="timeRange" />
          <FormControl.Label>Trim (upcoming feature)</FormControl.Label>
        </FormControl>
      </CheckboxGroup>
      <Box as="hr" width="100%" borderTop="none" />
      <Button disabled={selectedModes.every((mode) => conversions[mode]() === undefined)} onClick={() => startConvert()}>
        Start
      </Button>
      <Text as="label" color="neutral.emphasis" fontSize={1}>
        Exporting does not upload your videos. It will take few minutes to process the video, depends on your computer's performance.
      </Text>
    </Box>
  );
}
