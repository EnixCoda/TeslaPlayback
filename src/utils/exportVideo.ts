import type { ProgressEventCallback } from "@ffmpeg/ffmpeg/dist/esm/types";
import { fetchFile } from "@ffmpeg/util";
import fontArial from "../assets/fonts/Arial.ttf?url";
import { loadFFMpeg } from "./ffmpeg.entry";
import { readFileAsArrayBuffer } from "./general";
import { memoize } from "./memoize";

const filenames = {
  input: "input.mp4",
  front: "input_front.mp4",
  back: "input_back.mp4",
  left: "input_left.mp4",
  right: "input_right.mp4",
  output: "output.mp4",
  font: "font.ttf",
};

const rawArgs = {
  xstack: `
    -i
    ${filenames.front}
    -i
    ${filenames.back}
    -vsync
    0
    -r
    36
    -filter_complex
    xstack=inputs=2:layout=0_0|0_h0
    -c:a
    copy
    ${filenames.output}
  `,
  vstack: `
    -i
    ${filenames.front}
    -i
    ${filenames.back}
    -vsync
    0
    -r
    36
    -filter_complex
    vstack=inputs=2
    ${filenames.output}
  `,
  vstack2: `
    -i
    ${filenames.front}
    -i
    ${filenames.back}
    -i
    ${filenames.left}
    -i
    ${filenames.right}
    -vsync
    0
    -r
    36
    -filter_complex
    xstack=inputs=4:layout=0_0|0_h0|w0_0|w0_h0
    -map "[v]"
    -c:a copy
    ${filenames.output}
  `,
  drawText: [
    `-i`,
    filenames.input,
    `-vf`,
    `drawtext=fontfile=${filenames.font}:text=\'hello\':box=1:fontsize=48:fontcolor=white:boxcolor=black`,
    `-threads`,
    filenames.output,
  ],
  addTimestamp: (baseTime: string) => [
    `-i`,
    filenames.input,
    `-vf`,
    `drawtext=fontfile=${filenames.font}:expansion=strftime:basetime=${baseTime}:text='%Y-%m-%d %H\\:%M\\:%S':box=1:fontsize=48:fontcolor=white:boxcolor=black`,
    filenames.output,
  ],
};

export const mergeVideos = async (frontFile: File, backFile: File, onProgress?: ProgressEventCallback) => {
  const ffmpeg = await loadFFMpeg();
  ffmpeg.on("progress", (progress) => {
    onProgress?.(progress);
  });
  await ffmpeg.writeFile(filenames.front, new Uint8Array(await readFileAsArrayBuffer(frontFile)));
  await ffmpeg.writeFile(filenames.back, new Uint8Array(await readFileAsArrayBuffer(backFile)));
  const args = rawArgs.vstack
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  await ffmpeg.exec(args);
  const outputFile = await ffmpeg.readFile(filenames.output);
  return outputFile;
};

export const drawTextToVideo = async (originalFile: File, onProgress?: ProgressEventCallback) => {
  const ffmpeg = await loadFFMpeg();
  ffmpeg.on("progress", (progress) => {
    onProgress?.(progress);
  });
  await ffmpeg.writeFile(filenames.input, new Uint8Array(await readFileAsArrayBuffer(originalFile)));
  await ffmpeg.writeFile(filenames.font, await loadFontFile());
  const args = rawArgs.drawText;
  await ffmpeg.exec(args);
  const outputFile = await ffmpeg.readFile(filenames.output);
  return outputFile;
};

export const addTimestampToVideo = async (originalFile: File, baseTime: Date, onProgress?: ProgressEventCallback) => {
  const ffmpeg = await loadFFMpeg();
  ffmpeg.on("progress", (progress) => {
    onProgress?.(progress);
  });
  await ffmpeg.writeFile(filenames.input, new Uint8Array(await readFileAsArrayBuffer(originalFile)));
  await ffmpeg.writeFile(filenames.font, await loadFontFile());
  const args = rawArgs
    .addTimestamp(baseTime + "000")
    .map((line) => line.trim())
    .filter(Boolean);
  await ffmpeg.exec(args);
  const outputFile = await ffmpeg.readFile(filenames.output);
  return outputFile;
};

const loadFontFile = memoize(async function loadFontFile() {
  return await fetchFile(new URL(fontArial, import.meta.url).toString());
});
