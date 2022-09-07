import type { ProgressCallback } from "@ffmpeg/ffmpeg";
import { readFileAsArrayBuffer } from "./general";

// import ffmpeg from "../ffmpeg-core/dist/ffmpeg-core.wasm";

// console.log(ffmpeg);
// console.log(
//   ffmpeg({
//     a: "",
//   })
// );

const filenames = {
  front: "input_front.mp4",
  back: "input_back.mp4",
  output: "output.mp4",
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
    -filter_complex
    vstack=inputs=2
    ${filenames.output}
  `,
};

export const mergeVideos = async (frontFile: File, backFile: File, onProgress?: ProgressCallback) => {
  const ffmpeg = await loadFFMpeg();
  ffmpeg.setProgress((progress) => {
    onProgress?.(progress);
  });
  ffmpeg.FS("writeFile", filenames.front, new Uint8Array(await readFileAsArrayBuffer(frontFile)));
  ffmpeg.FS("writeFile", filenames.back, new Uint8Array(await readFileAsArrayBuffer(backFile)));
  const args = rawArgs.vstack
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  await ffmpeg.run(...args);
  const outputFile = ffmpeg.FS("readFile", filenames.output);
  return outputFile;
};

async function loadFFMpeg() {
  const { createFFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = createFFmpeg({
    corePath: `https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js`,
    log: true,
  });
  await ffmpeg.load();
  return ffmpeg;
}
