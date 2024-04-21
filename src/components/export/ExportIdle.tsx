import { Box, Button, Checkbox, FormControl, Radio, RadioGroup, Text, TextInput } from "@primer/react";
import { useEffect, useMemo, useState } from "react";
import UAParserJS from "ua-parser-js";
import { ExportState } from ".";
import { TeslaFS } from "../../TeslaFS";
import { Directions, VideoClipGroup } from "../../common";
import { DrawTextOptions } from "../../utils/FFmpegArgsComposer";
import { processVideo } from "../../utils/exportVideo";
import { loadFFMpeg } from "../../utils/ffmpeg.entry";
import { entries, getBlob } from "../../utils/general";
import { ExpandButton } from "../base/ExpandButton";
import { Select } from "../base/Select";
import { useNumberField } from "./useNumberField";

type CameraOption = Directions | "all";
const cameraOptions: Option<CameraOption>[] = [
  { value: "front", label: "Front" },
  { value: "rear", label: "Rear" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "all", label: "Merge All (experimental)" },
];

export function ExportIdle({
  setExportState,
  videos,
  totalTime,
}: {
  setExportState: (state: ExportState) => void;
  videos: VideoClipGroup;
  totalTime?: number;
}) {
  const [view, setView] = useState<CameraOption>("front");
  const fileMap = useMemo(() => {
    const { front, rear, left, right } = videos;
    if (view === "all") {
      if (front || rear || left || right) return { front, rear, left, right };
    } else if (videos[view]) {
      return { [view]: videos[view] } satisfies Partial<Record<Directions, File | undefined>>;
    }
  }, [view, videos]);

  const [textToDraw, setTextToDraw] = useState("");
  const [shouldDrawText, setShouldDrawText] = useState(true);
  const [drawTextMode, setDrawTextMode] = useState<"timestamp" | "custom">("timestamp");

  const fontSizeField = useNumberField(72);
  const [drawTextOptions, setDrawTextOptions] = useState<DrawTextOptions>({
    fontSize: fontSizeField.value,
    fontColor: "#ffffff",
    box: true,
    boxColor: "#000000",
  });
  useEffect(() => {
    setDrawTextOptions({ ...drawTextOptions, fontSize: fontSizeField.value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSizeField.value]);

  const trimStartField = useNumberField(0);
  const trimEndField = useNumberField(totalTime ? Math.floor(totalTime + 1) : 60);

  const resolvedTextToDraw = useMemo(() => {
    if (!fileMap) return undefined;

    if (drawTextMode === "timestamp") {
      return entries(fileMap).reduce(
        (acc, [, file]) => acc ?? (file ? TeslaFS.parseFileNameDate(file.name) : undefined),
        undefined as Date | undefined
      );
    } else {
      return textToDraw;
    }
  }, [drawTextMode, textToDraw, fileMap]);

  const allFieldsValid =
    !!fileMap && trimStartField.validation === null && trimEndField.validation === null && (!shouldDrawText || fontSizeField.validation === null);

  const startConvert = async () => {
    try {
      if (!fileMap) return;

      let failed = false;
      setExportState({ state: "loadingFFMpeg" });
      const ffmpeg = await loadFFMpeg();
      setExportState({ state: "processing", ffmpeg, totalTime: trimEndField.value - trimStartField.value || undefined });
      ffmpeg.on("log", ({ message }) => {
        console.log("[ffmpeg]", message);
        switch (message) {
          case "Aborted(OOM)": {
            failed = true;
            setExportState({ state: "fail", reason: "ffmpeg ran out of memory." });
            break;
          }
        }
      });
      const outputFile = await processVideo(ffmpeg, fileMap, {
        textToDraw: resolvedTextToDraw,
        textStyle: drawTextOptions,
        trim: {
          startTime: trimStartField.value,
          endTime: trimEndField.value,
        },
      });
      if (typeof outputFile === "string") {
        failed = true;
        setExportState({
          state: "fail",
          reason: `ffmpeg emitted a string output: ${outputFile}`,
        });
        console.error({ outputFile });
      } else {
        if (!failed) setExportState({ state: "done", output: getBlob(outputFile, "video/mp4") });
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
            if (err.message.startsWith("Failed to fetch dynamically imported module:")) {
              setExportState({ state: "fail", reason: "Failed to load extra dependency for processing videos. Please enable network and retry." });
              return;
            }

            console.error(err);
            setExportState({ state: "fail", reason: err.message });
            return;
        }
      }
      console.error(err);
      let message = err;
      if (err === "ReferenceError: SharedArrayBuffer is not defined") {
        message = "insecure network context";
      }
      setExportState({ state: "fail", reason: `Failed processing video: ${message}` });
    }
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
      <Text>Please use Chrome/Edge to export videos with better performance.</Text>
      <FormControl>
        <FormControl.Label>Cameras</FormControl.Label>
        <Select<CameraOption> sx={{ width: "100%" }} value={view} onChange={(option) => setView(option)} options={cameraOptions} />
        {view === "all" && !new UAParserJS().getBrowser().name?.includes("Firefox") && (
          <FormControl.Validation variant="error">Merging all is only supported on Firefox.</FormControl.Validation>
        )}
        <FormControl.Caption>The source camera for exporting. Choose "All" to merge videos from 4 cameras.</FormControl.Caption>
      </FormControl>
      <FormControl>
        <Checkbox checked={shouldDrawText} onChange={(e) => setShouldDrawText(e.target.checked)} />
        <FormControl.Label>Draw text</FormControl.Label>
        {shouldDrawText && (
          <FormControl.Caption>
            <Box>
              <RadioGroup name="drawTextMode" onChange={(v) => setDrawTextMode(v as typeof drawTextMode)}>
                <RadioGroup.Label>Text content</RadioGroup.Label>
                <FormControl>
                  <Radio value="timestamp" checked={drawTextMode === "timestamp"} />
                  <FormControl.Label>Timestamp</FormControl.Label>
                  <FormControl.Caption>e.g. 2077-01-01 11:22:33</FormControl.Caption>
                </FormControl>
                <FormControl>
                  <Radio value="custom" checked={drawTextMode === "custom"} />
                  <FormControl.Label>Custom</FormControl.Label>
                  <FormControl.Caption>
                    <FormControl disabled={drawTextMode !== "custom"}>
                      <FormControl.Label visuallyHidden>Text to draw</FormControl.Label>
                      <TextInput placeholder="Text to draw" value={textToDraw} onChange={(e) => setTextToDraw(e.target.value)} />
                    </FormControl>
                  </FormControl.Caption>
                </FormControl>
              </RadioGroup>
            </Box>
            <Box mt={2}>
              <ExpandButton buttonProps={{ children: "Text Style" }}>
                <Box ml={4} py={1}>
                  <FormControl>
                    <FormControl.Label>Font Size</FormControl.Label>
                    <TextInput type="number" value={fontSizeField.raw ?? ""} onChange={(e) => fontSizeField.setRaw(e.target.value)} />
                    {fontSizeField.validation && (
                      <FormControl.Validation variant={fontSizeField.validation.type}>{fontSizeField.validation.message}</FormControl.Validation>
                    )}
                  </FormControl>
                  <FormControl>
                    <FormControl.Label>Font Color</FormControl.Label>
                    <input
                      type="color"
                      value={drawTextOptions.fontColor ?? ""}
                      onChange={(e) => setDrawTextOptions({ ...drawTextOptions, fontColor: e.target.value })}
                    />
                  </FormControl>
                  <FormControl>
                    <FormControl.Label>Box Color</FormControl.Label>
                    <input
                      type="color"
                      value={drawTextOptions.boxColor ?? ""}
                      onChange={(e) => setDrawTextOptions({ ...drawTextOptions, boxColor: e.target.value })}
                    />
                  </FormControl>
                </Box>
              </ExpandButton>
            </Box>
          </FormControl.Caption>
        )}
      </FormControl>
      <Box display="flex" sx={{ gap: 2 }}>
        <FormControl disabled={!totalTime}>
          <FormControl.Label>Trim Start</FormControl.Label>
          <TextInput
            type="number"
            min={0}
            max={totalTime}
            trailingVisual="seconds"
            value={trimStartField.raw ?? ""}
            onChange={(e) => trimStartField.setRaw(e.target.value)}
          />
          {trimStartField.validation && (
            <FormControl.Validation variant={trimStartField.validation.type}>{trimStartField.validation.message}</FormControl.Validation>
          )}
        </FormControl>
        <FormControl disabled={!totalTime}>
          <FormControl.Label>Trim End</FormControl.Label>
          <TextInput
            type="number"
            min={0}
            max={totalTime}
            trailingVisual="seconds"
            value={trimEndField.raw ?? ""}
            onChange={(e) => trimEndField.setRaw(e.target.value)}
          />
          {trimEndField.validation && (
            <FormControl.Validation variant={trimEndField.validation.type}>{trimEndField.validation.message}</FormControl.Validation>
          )}
        </FormControl>
      </Box>
      <Box as="hr" width="100%" borderTop="none" />
      <Button variant="primary" disabled={!allFieldsValid} onClick={() => startConvert()}>
        Start
      </Button>
      <Text as="label" color="neutral.emphasis" fontSize={1}>
        Exporting does not upload your videos.
      </Text>
      <Text as="label" color="neutral.emphasis" fontSize={1}>
        It will take 3~20 minutes to process the video, depends on your computer's performance. You can reduce the time by reduce video duration with
        Trim Start and Trim End.
      </Text>
    </Box>
  );
}
