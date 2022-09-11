import type { ProgressCallback } from "@ffmpeg/ffmpeg";
import { createFFmpeg } from "@ffmpeg/ffmpeg";
import { readFileAsArrayBuffer } from "./general";

// import ffmpegWASM from "../../../ffmpeg-core/dist/ffmpeg-core.wasm";
// console.log(ffmpegWASM);

// const { createFFmpegCore } = require("../../../ffmpeg-core/dist/ffmpeg-core.js");
// console.log(createFFmpegCore);


// setTimeout(() => {
//   debugger;

//   const ffmpeg = createFFmpeg({
//     // corePath: `https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js`,
//     log: true,
//   });
//   ffmpeg.load();
// }, 1000);

const filenames = {
  front: "input_front.mp4",
  back: "input_back.mp4",
  left: "input_left.mp4",
  right: "input_right.mp4",
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
  // const { createFFmpeg } = await import("@ffmpeg/ffmpeg");
  const ffmpeg = createFFmpeg({
    corePath: `https://unpkg.com/@ffmpeg/core@0.10.0/dist/ffmpeg-core.js`,
    log: true,
  });
  await ffmpeg.load();
  return ffmpeg;
}
