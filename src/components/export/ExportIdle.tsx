import { Box, Button, Checkbox, FormControl, Radio, RadioGroup, Text, TextInput } from "@primer/react";
import { useEffect, useMemo, useState } from "react";
import { ExportState } from ".";
import { TeslaFS } from "../../TeslaFS";
import { Directions, VideoClipGroup, directions } from "../../common";
import { DrawTextOptions } from "../../utils/FFmpegArgsComposer";
import { processVideo } from "../../utils/exportVideo";
import { entries, getBlob } from "../../utils/general";
import { ExpandButton } from "../base/ExpandButton";
import { Select } from "../base/Select";
import { useNumberField } from "./useNumberField";

type CameraOption = Directions | "all";
const cameraOptions: Option<CameraOption>[] = ([...directions, "all"] satisfies CameraOption[]).map((option) => ({
  value: option,
  label: option.toUpperCase()[0] + option.substring(1),
}));

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
    const { front, back, left, right } = videos;
    if (view === "all") {
      if (front || back || left || right) return { front, back, left, right };
    } else if (videos[view]) {
      return { [view]: videos[view] } satisfies Partial<Record<Directions, File | undefined>>;
    }
  }, [view, videos]);

  const [textToDraw, setTextToDraw] = useState("");
  const [shouldDrawText, setShouldDrawText] = useState(false);
  const [drawTextMode, setDrawTextMode] = useState<"timestamp" | "custom">("timestamp");

  const fontSizeField = useNumberField(36);
  const [drawTextOptions, setDrawTextOptions] = useState<DrawTextOptions>({
    fontSize: 36,
    fontColor: "#ffffff",
    box: true,
    boxColor: "#000000",
  });
  useEffect(() => {
    setDrawTextOptions({ ...drawTextOptions, fontSize: fontSizeField.value });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fontSizeField.value]);

  const trimStartField = useNumberField(0);
  const trimEndField = useNumberField(totalTime ?? 60);

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
      const outputFile = await processVideo(
        (ffmpeg) => {
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
        },
        fileMap,
        {
          textToDraw: resolvedTextToDraw,
          textStyle: drawTextOptions,
          trim: {
            startTime: trimStartField.value,
            endTime: trimEndField.value,
          },
        }
      );
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
            console.error(err);
            setExportState({ state: "fail", reason: err.message });
            return;
        }
      }
      console.error(err);
      setExportState({ state: "fail", reason: `Failed processing video: ${err}` });
    }
  };

  return (
    <Box display="flex" flexDirection="column" sx={{ gap: 2 }}>
      <FormControl>
        <FormControl.Label>Cameras</FormControl.Label>
        <Select<CameraOption> sx={{ width: "100%" }} value={view} onChange={(option) => setView(option)} options={cameraOptions} />
        {view === "all" && (
          <FormControl.Caption>
            Exporting all cameras will merge them into a single video. This feature might only work on Firefox, not available on other browsers.
          </FormControl.Caption>
        )}
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
        It will take few minutes to process the video, depends on your computer's performance.
      </Text>
    </Box>
  );
}
