import { FFmpeg } from "@ffmpeg/ffmpeg";
import workerUrl from "@ffmpeg/ffmpeg/dist/esm/worker.js?worker&url";
import { toBlobURL } from "@ffmpeg/util";

import ffmpegCoreJs from "@ffmpeg/core-mt/dist/esm/ffmpeg-core.js?raw";
import ffmpegCoreWorkerJs from "@ffmpeg/core-mt/dist/esm/ffmpeg-core.worker.js?raw";
import ffmpegCoreWasm from "@ffmpeg/core-mt/dist/esm/ffmpeg-core.wasm?url";

// do NOT import this file directly, checkout './ffmpeg.entry.ts' instead
export async function createFFMpeg() {
  const ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: await toBlobURL(URL.createObjectURL(new Blob([ffmpegCoreJs])), "text/javascript"),
    workerURL: await toBlobURL(URL.createObjectURL(new Blob([ffmpegCoreWorkerJs])), "text/javascript"),
    wasmURL: await toBlobURL(ffmpegCoreWasm, "application/wasm"),
    classWorkerURL: new URL(workerUrl, import.meta.url).toString(),
  });

  return ffmpeg;
}
